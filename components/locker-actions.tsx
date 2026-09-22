import {
  approveRequestAction,
  denyRequestAction,
  markReturnedAction,
} from "@/app/actions/transactions";
import { deleteItemAction } from "@/app/actions/items";

function ActionButton({
  label,
  action,
  tone = "gold",
}: {
  label: string;
  action: () => Promise<void>;
  tone?: "gold" | "blue" | "ghost";
}) {
  const className =
    tone === "gold"
      ? "rounded-full bg-ud-gold px-3 py-1.5 text-sm font-semibold text-ud-blue-dark"
      : tone === "blue"
        ? "rounded-full bg-ud-blue px-3 py-1.5 text-sm font-semibold text-white"
        : "rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-ud-blue";

  return (
    <form action={action}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

export function ApproveButton({ transactionId }: { transactionId: string }) {
  return (
    <ActionButton
      label="Approve"
      tone="gold"
      action={approveRequestAction.bind(null, transactionId)}
    />
  );
}

export function DenyButton({ transactionId }: { transactionId: string }) {
  return (
    <ActionButton
      label="Deny"
      tone="ghost"
      action={denyRequestAction.bind(null, transactionId)}
    />
  );
}

export function ReturnButton({ transactionId }: { transactionId: string }) {
  return (
    <ActionButton
      label="Mark as Returned"
      tone="gold"
      action={markReturnedAction.bind(null, transactionId)}
    />
  );
}

export function DeleteListingButton({ itemId }: { itemId: string }) {
  return (
    <ActionButton
      label="Remove listing"
      tone="ghost"
      action={deleteItemAction.bind(null, itemId)}
    />
  );
}
