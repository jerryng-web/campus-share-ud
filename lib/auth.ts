import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export async function getClaims() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
}

export async function getCurrentUserId() {
  const claims = await getClaims();
  return typeof claims?.sub === "string" ? claims.sub : null;
}

export async function requireUserId(nextPath?: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }
  return userId;
}

export async function getCurrentProfile(): Promise<Tables<"profiles"> | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return data;
}
