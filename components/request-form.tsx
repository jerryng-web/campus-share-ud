"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestItemAction, type RequestState } from "@/app/actions/transactions";

const initialState: RequestState = {};

export function RequestForm({
  itemId,
  isLoggedIn,
  isOwner,
  isAvailable,
}: {
  itemId: string;
  isLoggedIn: boolean;
  isOwner: boolean;
  isAvailable: boolean;
}) {
  const [state, formAction, pending] = useActionState(requestItemAction, initialState);

  if (isOwner) {
    return (
      <p className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm text-muted">
        This is your listing. Manage requests from{" "}
        <Link href="/locker" className="font-semibold text-ud-blue underline">
          My Locker
        </Link>
        .
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <p className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm text-muted">
        <Link href={`/login?next=/items/${itemId}`} className="font-semibold text-ud-blue underline">
          Log in
        </Link>{" "}
        to request this item.
      </p>
    );
  }

  if (!isAvailable) {
    return (
      <p className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm text-muted">
        This item is not available to request right now. It stays listed until the owner removes it.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
      <input type="hidden" name="item_id" value={itemId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ud-blue">
          Start date
          <input
            type="date"
            name="start_date"
            required
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-ud-blue">
          Return date
          <input
            type="date"
            name="end_date"
            required
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5"
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-ud-blue">
        Student ID number
        <input
          name="borrower_student_id"
          required
          autoComplete="off"
          placeholder="Used only until the item is marked returned"
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5"
        />
      </label>
      <p className="text-xs leading-5 text-muted">
        Your student ID is logged with this request. The moment the item is marked returned, CampusShare
        erases that ID from the transaction history.
      </p>
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl bg-ud-gold/20 px-3 py-2 text-sm font-medium text-ud-blue-dark">
          {state.success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ud-gold px-4 py-3 text-sm font-semibold text-ud-blue-dark disabled:opacity-70"
      >
        {pending ? "Sending request…" : "Request to Borrow"}
      </button>
    </form>
  );
}
