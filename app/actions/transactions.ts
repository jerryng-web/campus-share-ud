"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type RequestState = {
  error?: string;
  success?: string;
};

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function requestItemAction(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const userId = await requireUserId();
  const itemId = clean(formData.get("item_id"));
  const startDate = clean(formData.get("start_date"));
  const endDate = clean(formData.get("end_date"));
  const studentId = clean(formData.get("borrower_student_id"));

  if (!itemId || !startDate || !endDate || !studentId) {
    return { error: "Add a date range and your student ID number to request this item." };
  }
  if (endDate < startDate) {
    return { error: "The return date must be on or after the start date." };
  }

  const supabase = await createClient();
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
    start_date: startDate,
    end_date: endDate,
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/locker");
  revalidatePath(`/items/${itemId}`);
  return { success: "Request sent. Watch My Locker for an approval." };
}

async function updateTransactionStatus(transactionId: string, status: "approved" | "denied" | "returned") {
  const userId = await requireUserId("/locker");
  const supabase = await createClient();

  const { data: transaction, error: loadError } = await supabase
    .from("transactions")
    .select("id, item_id, lender_id, borrower_id, status")
    .eq("id", transactionId)
    .maybeSingle();

  if (loadError || !transaction) {
    throw new Error("That request could not be found.");
  }

  if (status === "approved" || status === "denied") {
    if (transaction.lender_id !== userId) {
      throw new Error("Only the lender can approve or deny this request.");
    }
  }
  if (status === "returned") {
    if (transaction.lender_id !== userId && transaction.borrower_id !== userId) {
      throw new Error("Only the borrower or lender can mark this returned.");
    }
  }

  const { error } = await supabase
    .from("transactions")
    .update({ status })
    .eq("id", transactionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/locker");
  revalidatePath(`/items/${transaction.item_id}`);
}

export async function approveRequestAction(transactionId: string) {
  await updateTransactionStatus(transactionId, "approved");
}

export async function denyRequestAction(transactionId: string) {
  await updateTransactionStatus(transactionId, "denied");
}

export async function markReturnedAction(transactionId: string) {
  await updateTransactionStatus(transactionId, "returned");
}
