"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const firstName = clean(formData.get("first_name"));
  const lastName = clean(formData.get("last_name"));
  const email = clean(formData.get("email"));
  const password = clean(formData.get("password"));

  if (!firstName || !lastName || !email || !password) {
    return { error: "Please fill in your name, email, and password." };
  }
  if (password.length < 8) {
    return { error: "Use a password with at least 8 characters." };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/locker`,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/signup/check-email");
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = clean(formData.get("email"));
  const password = clean(formData.get("password"));
  const next = clean(formData.get("next")) || "/locker";

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(next.startsWith("/") ? next : "/locker");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
