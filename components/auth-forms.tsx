"use client";

import { useActionState } from "react";
import { signInAction, signUpAction, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

const fieldClass =
  "mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5";

export function LoginForm({ next, error }: { next: string; error?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-medium text-ud-blue">
        Email
        <input name="email" type="email" required className={fieldClass} />
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Password
        <input name="password" type="password" required className={fieldClass} />
      </label>
      {error === "confirm" ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          That confirmation link could not be used. Try signing in, or request a new signup email.
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ud-gold px-4 py-3 text-sm font-semibold text-ud-blue-dark disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ud-blue">
          First name
          <input name="first_name" required className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-ud-blue">
          Last name
          <input name="last_name" required className={fieldClass} />
        </label>
      </div>
      <label className="block text-sm font-medium text-ud-blue">
        Email
        <input name="email" type="email" required className={fieldClass} />
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Password
        <input name="password" type="password" minLength={8} required className={fieldClass} />
      </label>
      <p className="text-xs leading-5 text-muted">
        We show only your first name and last initial on public listings. We never collect age.
      </p>
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ud-gold px-4 py-3 text-sm font-semibold text-ud-blue-dark disabled:opacity-70"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
