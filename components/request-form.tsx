"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestItemAction, type RequestState } from "@/app/actions/transactions";

const initialState: RequestState = {};
const fieldClass = "mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5";

export function RequestForm({
  itemId,
  isLoggedIn,
  isOwner,
  isAvailable,
  flagged,
}: {
  itemId: string;
  isLoggedIn: boolean;
  isOwner: boolean;
  isAvailable: boolean;
  flagged?: boolean;
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

  if (flagged) {
    return (
      <p className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm text-muted">
        This account cannot start new borrow requests.
      </p>
    );
  }

  if (!isAvailable) {
    return (
      <p className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm text-muted">
        This item is off the market while a request is pending or it is on loan.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
      <input type="hidden" name="item_id" value={itemId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ud-blue">
          Pickup date and time
          <input type="datetime-local" name="pickup_at" required className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-ud-blue">
          Return date and time
          <input type="datetime-local" name="return_at" required className={fieldClass} />
        </label>
      </div>
      <label className="block text-sm font-medium text-ud-blue">
        Message to the owner
        <textarea
          name="request_message"
          rows={3}
          placeholder="When you can meet, questions, how you will use it…"
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Phone number
        <input
          name="borrower_phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="For emergencies or questions"
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Student ID number
        <input
          name="borrower_student_id"
          required
          autoComplete="off"
          placeholder="Used only until the owner inspects the return"
          className={fieldClass}
        />
      </label>
      <p className="text-xs leading-5 text-muted">
        Your request takes this item off Browse until both of you agree on times, or 24 hours pass.
        After a normal return, CampusShare erases the student ID and this request’s phone copy.
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
