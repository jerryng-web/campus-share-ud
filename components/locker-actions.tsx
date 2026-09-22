"use client";

import {
  acceptExtensionAction,
  acceptTimesAction,
  counterTimesAction,
  denyRequestAction,
  inspectReturnAction,
  markHandedBackAction,
  proposeExtensionAction,
  reportIncidentAction,
  sendLoanMessageAction,
  submitReviewAction,
} from "@/app/actions/transactions";
import { deleteItemAction } from "@/app/actions/items";
import { formatStamp, toDatetimeLocalValue } from "@/lib/campus";

function Button({
  label,
  tone = "gold",
}: {
  label: string;
  tone?: "gold" | "blue" | "ghost";
}) {
  const className =
    tone === "gold"
      ? "rounded-full bg-ud-gold px-3 py-1.5 text-sm font-semibold text-ud-blue-dark"
      : tone === "blue"
        ? "rounded-full bg-ud-blue px-3 py-1.5 text-sm font-semibold text-white"
        : "rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-ud-blue";
  return (
    <button type="submit" className={className}>
      {label}
    </button>
  );
}

const fieldClass = "mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2 text-sm";

export function AcceptTimesButton({ transactionId }: { transactionId: string }) {
  return (
    <form action={acceptTimesAction.bind(null, transactionId)}>
      <Button label="Accept these times" />
    </form>
  );
}

export function DenyButton({ transactionId }: { transactionId: string }) {
  return (
    <form action={denyRequestAction.bind(null, transactionId)}>
      <Button label="Deny" tone="ghost" />
    </form>
  );
}

export function CounterTimesForm({
  transactionId,
  pickupAt,
  returnAt,
}: {
  transactionId: string;
  pickupAt?: string | null;
  returnAt?: string | null;
}) {
  return (
    <form action={counterTimesAction.bind(null, transactionId)} className="mt-3 space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-medium text-ud-blue">
          Pickup
          <input
            type="datetime-local"
            name="pickup_at"
            required
            defaultValue={toDatetimeLocalValue(pickupAt)}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-medium text-ud-blue">
          Return
          <input
            type="datetime-local"
            name="return_at"
            required
            defaultValue={toDatetimeLocalValue(returnAt)}
            className={fieldClass}
          />
        </label>
      </div>
      <Button label="Send new times" tone="blue" />
    </form>
  );
}

export function HandBackButton({ transactionId }: { transactionId: string }) {
  return (
    <form action={markHandedBackAction.bind(null, transactionId)}>
      <Button label="Mark handed back" />
    </form>
  );
}

export function InspectButtons({ transactionId, itemId }: { transactionId: string; itemId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={inspectReturnAction.bind(null, transactionId, true)}>
        <Button label="Inspected — list again" />
      </form>
      <form
        action={async () => {
          await inspectReturnAction(transactionId, false);
          await deleteItemAction(itemId);
        }}
      >
        <Button label="Inspected — remove listing" tone="ghost" />
      </form>
    </div>
  );
}

export function DeleteListingButton({ itemId }: { itemId: string }) {
  return (
    <form action={deleteItemAction.bind(null, itemId)}>
      <Button label="Remove listing" tone="ghost" />
    </form>
  );
}

export function MessageForm({ transactionId }: { transactionId: string }) {
  return (
    <form action={sendLoanMessageAction.bind(null, transactionId)} className="mt-3 space-y-2">
      <label className="block text-xs font-medium text-ud-blue">
        Message
        <textarea name="body" required rows={2} className={fieldClass} />
      </label>
      <Button label="Send message" tone="blue" />
    </form>
  );
}

export function ExtensionForm({ transactionId }: { transactionId: string }) {
  return (
    <form action={proposeExtensionAction.bind(null, transactionId)} className="mt-3 space-y-2">
      <label className="block text-xs font-medium text-ud-blue">
        New return date and time
        <input type="datetime-local" name="extension_return_at" required className={fieldClass} />
      </label>
      <Button label="Propose extension" />
    </form>
  );
}

export function AcceptExtensionButton({ transactionId }: { transactionId: string }) {
  return (
    <form action={acceptExtensionAction.bind(null, transactionId)}>
      <Button label="Accept extension" />
    </form>
  );
}

export function ExtensionHandshake({
  transactionId,
  proposedAt,
  waitingOnYou,
  waitingOnThem,
}: {
  transactionId: string;
  proposedAt?: string | null;
  waitingOnYou: boolean;
  waitingOnThem: boolean;
}) {
  if (!proposedAt) return null;
  return (
    <div className="rounded-lg bg-ud-gold/30 px-2 py-2">
      <p className="text-xs font-medium text-ud-blue-dark">
        Extension proposed: {formatStamp(proposedAt)}
      </p>
      {waitingOnYou ? <AcceptExtensionButton transactionId={transactionId} /> : null}
      {waitingOnThem ? (
        <p className="mt-1 text-xs text-muted">Waiting for the other student to accept the new return time.</p>
      ) : null}
    </div>
  );
}

export function IncidentForm({
  transactionId,
  purchasePrice,
}: {
  transactionId: string;
  purchasePrice: number;
}) {
  return (
    <form action={reportIncidentAction.bind(null, transactionId)} className="mt-3 space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
      <p className="text-xs font-semibold text-red-800">Lost, damaged, or stolen</p>
      <label className="block text-xs font-medium text-ud-blue">
        What happened
        <select name="incident_type" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Select
          </option>
          <option value="lost">Lost</option>
          <option value="damaged">Damaged</option>
          <option value="stolen">Stolen</option>
        </select>
      </label>
      <label className="block text-xs font-medium text-ud-blue">
        Flag this borrower
        <select name="flag_level" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Select
          </option>
          <option value="caution">Caution</option>
          <option value="beware">Beware</option>
          <option value="do_not_recommend">Do not recommend</option>
        </select>
      </label>
      <p className="text-xs text-muted">
        The borrower is billed ${Number(purchasePrice).toFixed(2)}, the listing purchase price.
        Caution, Beware, and Do not recommend all block this phone from new signups.
      </p>
      <Button label="Report and bill borrower" tone="ghost" />
    </form>
  );
}

export function ReviewForm({
  transactionId,
  role,
}: {
  transactionId: string;
  role: "lender" | "borrower";
}) {
  const conditionLabel =
    role === "borrower"
      ? "Item condition when you received it"
      : "Item condition when it was returned";
  const instructionLabel =
    role === "borrower"
      ? "Pickup and use matched the owner’s instructions"
      : "Borrower followed your instructions";

  return (
    <form action={submitReviewAction.bind(null, transactionId)} className="mt-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ud-blue">Rate this loan (1 poor – 5 excellent)</p>
      <ScoreField name="communication" label="Communication" />
      <ScoreField name="item_condition" label={conditionLabel} />
      <ScoreField name="followed_instructions" label={instructionLabel} />
      <Button label="Submit rating" />
    </form>
  );
}

function ScoreField({ name, label }: { name: string; label: string }) {
  return (
    <fieldset>
      <legend className="text-xs font-medium text-ud-blue">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="inline-flex items-center gap-1 text-sm">
            <input type="radio" name={name} value={value} required />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
