"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { fromDatetimeLocal, isOverdue } from "@/lib/campus";
import { isValidUsPhone, normalizePhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export type RequestState = {
  error?: string;
  success?: string;
};

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function score(value: FormDataEntryValue | null) {
  const n = Number(clean(value));
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

function refresh(itemId?: string) {
  revalidatePath("/");
  revalidatePath("/locker");
  if (itemId) revalidatePath(`/items/${itemId}`);
}

export async function expireStaleRequests() {
  const supabase = await createClient();
  await supabase.rpc("expire_stale_requests");
}

async function saveAccountPhone(userId: string, phone: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("account_phones").upsert({
    user_id: userId,
    phone,
    phone_normalized: normalizePhone(phone),
  });
  return error?.message ?? null;
}

export async function requestItemAction(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const userId = await requireUserId();
  const itemId = clean(formData.get("item_id"));
  const pickupRaw = clean(formData.get("pickup_at"));
  const returnRaw = clean(formData.get("return_at"));
  const studentId = clean(formData.get("borrower_student_id"));
  const phone = clean(formData.get("borrower_phone"));
  const message = clean(formData.get("request_message"));
  const pickupAt = fromDatetimeLocal(pickupRaw);
  const returnAt = fromDatetimeLocal(returnRaw);

  if (!itemId || !pickupAt || !returnAt || !studentId || !phone) {
    return { error: "Add pickup and return times, your student ID, and a phone number." };
  }
  if (!isValidUsPhone(phone)) {
    return { error: "Enter a 10-digit U.S. phone number for emergencies." };
  }
  if (returnAt <= pickupAt) {
    return { error: "The return time must be after pickup." };
  }

  const supabase = await createClient();
  await supabase.rpc("expire_stale_requests");

  const { data: flag } = await supabase.rpc("current_borrower_flag", { p_user: userId });
  if (flag) {
    return { error: "This account cannot start new borrow requests." };
  }

  const { data: blocked } = await supabase.rpc("is_phone_blocked", { raw: phone });
  if (blocked) {
    return { error: "This phone number cannot be used to borrow items." };
  }

  const phoneError = await saveAccountPhone(userId, phone);
  if (phoneError) {
    if (phoneError.toLowerCase().includes("duplicate") || phoneError.toLowerCase().includes("unique")) {
      return { error: "That phone number is already used on another CampusShare account." };
    }
    return { error: phoneError };
  }

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("id, owner_id, status")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError || !item) {
    return { error: "That listing could not be found." };
  }
  if (item.owner_id === userId) {
    return { error: "You cannot request an item you listed." };
  }
  if (item.status !== "available") {
    return { error: "This item is not available right now." };
  }

  const { error } = await supabase.from("transactions").insert({
    item_id: item.id,
    lender_id: item.owner_id,
    borrower_id: userId,
    borrower_student_id: studentId,
    borrower_phone: phone,
    request_message: message || null,
    start_date: pickupAt.slice(0, 10),
    end_date: returnAt.slice(0, 10),
    proposed_pickup_at: pickupAt,
    proposed_return_at: returnAt,
    proposed_by: userId,
    borrower_accepted_at: new Date().toISOString(),
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  refresh(itemId);
  return { success: "Request sent. The listing is off the market until you and the owner agree on times." };
}

async function loadOwnedTransaction(transactionId: string) {
  const userId = await requireUserId("/locker");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .maybeSingle();
  if (error || !data) {
    throw new Error("That request could not be found.");
  }
  if (data.lender_id !== userId && data.borrower_id !== userId) {
    throw new Error("You cannot update this request.");
  }
  return { userId, supabase, transaction: data };
}

export async function acceptTimesAction(transactionId: string) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  if (transaction.status !== "pending") {
    throw new Error("Times can only be accepted on a pending request.");
  }
  const patch =
    userId === transaction.lender_id
      ? { lender_accepted_at: new Date().toISOString() }
      : { borrower_accepted_at: new Date().toISOString() };
  const { error } = await supabase.from("transactions").update(patch).eq("id", transactionId);
  if (error) throw new Error(error.message);
  refresh(transaction.item_id);
}

export async function counterTimesAction(transactionId: string, formData: FormData) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  if (transaction.status !== "pending") {
    throw new Error("Times can only be changed on a pending request.");
  }
  const pickupAt = fromDatetimeLocal(clean(formData.get("pickup_at")));
  const returnAt = fromDatetimeLocal(clean(formData.get("return_at")));
  if (!pickupAt || !returnAt || returnAt <= pickupAt) {
    throw new Error("Choose a pickup time and a later return time.");
  }
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("transactions")
    .update({
      proposed_pickup_at: pickupAt,
      proposed_return_at: returnAt,
      proposed_by: userId,
      start_date: pickupAt.slice(0, 10),
      end_date: returnAt.slice(0, 10),
      borrower_accepted_at: userId === transaction.borrower_id ? now : null,
      lender_accepted_at: userId === transaction.lender_id ? now : null,
    })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
  refresh(transaction.item_id);
}

export async function denyRequestAction(transactionId: string) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  if (transaction.lender_id !== userId) {
    throw new Error("Only the owner can deny this request.");
  }
  const { error } = await supabase.from("transactions").update({ status: "denied" }).eq("id", transactionId);
  if (error) throw new Error(error.message);
  refresh(transaction.item_id);
}

export async function markHandedBackAction(transactionId: string) {
  const { supabase, transaction } = await loadOwnedTransaction(transactionId);
  const { error } = await supabase
    .from("transactions")
    .update({ handed_back_at: new Date().toISOString() })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
  refresh(transaction.item_id);
}

export async function inspectReturnAction(transactionId: string, relist: boolean) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  if (transaction.lender_id !== userId) {
    throw new Error("Only the owner can finish inspection.");
  }
  const { error } = await supabase.from("transactions").update({ status: "returned" }).eq("id", transactionId);
  if (error) throw new Error(error.message);
  if (relist) {
    await supabase.from("items").update({ status: "available" }).eq("id", transaction.item_id).eq("owner_id", userId);
  }
  refresh(transaction.item_id);
}

export async function sendLoanMessageAction(transactionId: string, formData: FormData) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  const body = clean(formData.get("body"));
  if (!body) throw new Error("Write a short message first.");
  const { error } = await supabase.from("transaction_messages").insert({
    transaction_id: transactionId,
    sender_id: userId,
    body,
  });
  if (error) throw new Error(error.message);
  refresh(transaction.item_id);
}

export async function proposeExtensionAction(transactionId: string, formData: FormData) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  if (transaction.status !== "on_loan") {
    throw new Error("Extensions are only for items that are still out.");
  }
  if (!isOverdue(transaction.status, transaction.due_at)) {
    throw new Error("You can only extend a loan after the due time has passed.");
  }
  const returnAt = fromDatetimeLocal(clean(formData.get("extension_return_at")));
  if (!returnAt) throw new Error("Choose a new return date and time.");
  if (transaction.due_at && returnAt <= transaction.due_at) {
    throw new Error("Choose a return time after the current due time.");
  }
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("transactions")
    .update({
      extension_return_at: returnAt,
      extension_proposed_by: userId,
      extension_borrower_accepted_at: userId === transaction.borrower_id ? now : null,
      extension_lender_accepted_at: userId === transaction.lender_id ? now : null,
    })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
  refresh(transaction.item_id);
}

export async function acceptExtensionAction(transactionId: string) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  if (!transaction.extension_return_at) {
    throw new Error("There is no extension to accept.");
  }
  const now = new Date().toISOString();
  const patch =
    userId === transaction.lender_id
      ? { extension_lender_accepted_at: now }
      : { extension_borrower_accepted_at: now };
  const { error } = await supabase.from("transactions").update(patch).eq("id", transactionId);
  if (error) throw new Error(error.message);
  refresh(transaction.item_id);
}

export async function reportIncidentAction(transactionId: string, formData: FormData) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  if (transaction.lender_id !== userId) {
    throw new Error("Only the owner can report a lost, damaged, or stolen item.");
  }
  const incidentType = clean(formData.get("incident_type"));
  const flagLevel = clean(formData.get("flag_level"));
  if (!["lost", "damaged", "stolen"].includes(incidentType)) {
    throw new Error("Choose lost, damaged, or stolen.");
  }
  if (!["caution", "beware", "do_not_recommend"].includes(flagLevel)) {
    throw new Error("Choose Caution, Beware, or Do not recommend.");
  }

  const { data: item } = await supabase
    .from("items")
    .select("purchase_price")
    .eq("id", transaction.item_id)
    .maybeSingle();

  const { error } = await supabase
    .from("transactions")
    .update({
      status: "incident",
      incident_type: incidentType,
      billed_amount: item?.purchase_price ?? 0,
    })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);

  const { error: flagError } = await supabase.from("borrower_flags").insert({
    subject_id: transaction.borrower_id,
    set_by: userId,
    transaction_id: transactionId,
    level: flagLevel,
  });
  if (flagError) throw new Error(flagError.message);
  refresh(transaction.item_id);
}

export async function submitReviewAction(transactionId: string, formData: FormData) {
  const { userId, supabase, transaction } = await loadOwnedTransaction(transactionId);
  if (transaction.status !== "returned" && transaction.status !== "incident") {
    throw new Error("You can rate after the loan is finished.");
  }
  const communication = score(formData.get("communication"));
  const itemCondition = score(formData.get("item_condition"));
  const followed = score(formData.get("followed_instructions"));
  if (!communication || !itemCondition || !followed) {
    throw new Error("Rate communication, item condition, and instructions from 1 to 5.");
  }
  const isLender = userId === transaction.lender_id;
  const { error } = await supabase.from("reviews").insert({
    transaction_id: transactionId,
    rater_id: userId,
    subject_id: isLender ? transaction.borrower_id : transaction.lender_id,
    subject_role: isLender ? "borrower" : "lender",
    communication,
    item_condition: itemCondition,
    followed_instructions: followed,
  });
  if (error) throw new Error(error.message);
  refresh(transaction.item_id);
}
