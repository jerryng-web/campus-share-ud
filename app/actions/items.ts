"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BUILDINGS, CATEGORIES, COMPLEXES } from "@/lib/campus";
import { requireUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ItemFormState = {
  error?: string;
};

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createItemAction(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const userId = await requireUserId("/list");
  const title = clean(formData.get("title"));
  const category = clean(formData.get("category"));
  const complex = clean(formData.get("complex"));
  const building = clean(formData.get("building"));
  const description = clean(formData.get("description"));
  const pickup = clean(formData.get("pickup_instructions"));
  const priceRaw = clean(formData.get("purchase_price"));
  const purchasePrice = Number(priceRaw);

  if (!title || !category || !complex || !building || !description || !priceRaw) {
    return { error: "Please complete every field before listing your item." };
  }
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
    return { error: "Enter what you paid for this item, using 0 if it was free." };
  }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "Choose a valid category." };
  }
  if (!COMPLEXES.includes(complex as (typeof COMPLEXES)[number])) {
    return { error: "Choose a valid UD complex." };
  }
  const allowedBuildings = BUILDINGS[complex as (typeof COMPLEXES)[number]];
  if (!allowedBuildings.includes(building)) {
    return { error: "Choose a building that matches that complex." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("items").insert({
    owner_id: userId,
    title,
    category,
    complex,
    building,
    description,
    pickup_instructions: pickup || null,
    purchase_price: purchasePrice,
    status: "available",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/locker");
  redirect("/locker");
}

export async function deleteItemAction(itemId: string) {
  const userId = await requireUserId("/locker");
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId)
    .eq("owner_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/locker");
  revalidatePath(`/items/${itemId}`);
}
