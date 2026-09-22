import { notFound } from "next/navigation";
import { RequestForm } from "@/components/request-form";
import { getCurrentUserId } from "@/lib/auth";
import {
  categoryIcon,
  formatDate,
  formatStamp,
  publicDisplayName,
  statusLabel,
} from "@/lib/campus";
import { createClient } from "@/lib/supabase/server";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { data: item } = await supabase
    .from("items")
    .select(
      "id, title, description, pickup_instructions, category, complex, building, status, owner_id, owner:profiles!owner_id(first_name, last_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  const owner = Array.isArray(item.owner) ? item.owner[0] : item.owner;
  const isOwner = userId === item.owner_id;

  let history: {
    id: string;
    status: string;
    start_date: string;
    end_date: string;
    requested_at: string;
    approved_at: string | null;
    completed_at: string | null;
    borrower_student_id: string | null;
    borrower: { first_name: string; last_name: string } | null;
  }[] = [];

  if (userId) {
    const { data: transactions } = await supabase
      .from("transactions")
      .select(
        "id, status, start_date, end_date, requested_at, approved_at, completed_at, borrower_student_id, borrower_id, lender_id, borrower:profiles!borrower_id(first_name, last_name)",
      )
      .eq("item_id", item.id)
      .order("requested_at", { ascending: false });

    history = (transactions ?? []).map((row) => ({
      ...row,
      borrower: Array.isArray(row.borrower) ? row.borrower[0] : row.borrower,
    }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {categoryIcon(item.category)}
          </span>
          <span className="rounded-full bg-ud-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ud-blue-dark">
            {statusLabel(item.status)}
          </span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ud-blue">{item.title}</h1>
        <p className="mt-2 text-sm font-medium text-ud-blue/80">{item.category}</p>
        <p className="mt-2 text-muted">
          {item.complex} — {item.building}
        </p>
        <p className="mt-2 text-sm text-muted">
          Lender: {publicDisplayName(owner?.first_name, owner?.last_name)}
        </p>
        <p className="mt-6 leading-7 text-ink/85">{item.description}</p>
        {item.pickup_instructions ? (
          <div className="mt-6 rounded-2xl bg-cream p-4">
            <h2 className="font-display text-lg text-ud-blue">Pick-up instructions</h2>
            <p className="mt-2 text-sm leading-6">{item.pickup_instructions}</p>
          </div>
        ) : null}
      </section>

      <aside className="space-y-5">
        <RequestForm
          itemId={item.id}
          isLoggedIn={Boolean(userId)}
          isOwner={isOwner}
          isAvailable={item.status === "available"}
        />
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-lg text-ud-blue">Action history</h2>
          {!userId ? (
            <p className="mt-3 text-sm text-muted">
              Sign in to see request history you participate in.
            </p>
          ) : history.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No requests yet for this listing.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.map((entry) => (
                <li key={entry.id} className="rounded-xl bg-cream p-3 text-sm">
                  <p className="font-semibold text-ud-blue">{statusLabel(entry.status)}</p>
                  <p className="mt-1 text-muted">
                    {publicDisplayName(entry.borrower?.first_name, entry.borrower?.last_name)} ·{" "}
                    {formatDate(entry.start_date)} to {formatDate(entry.end_date)}
                  </p>
                  <p className="mt-1 text-xs text-muted">Requested {formatStamp(entry.requested_at)}</p>
                  {entry.approved_at ? (
                    <p className="text-xs text-muted">Approved {formatStamp(entry.approved_at)}</p>
                  ) : null}
                  {entry.completed_at ? (
                    <p className="text-xs text-muted">Returned {formatStamp(entry.completed_at)}</p>
                  ) : null}
                  {isOwner && entry.borrower_student_id ? (
                    <p className="mt-2 rounded-lg bg-ud-gold/30 px-2 py-1 text-xs font-medium text-ud-blue-dark">
                      Student ID on file: {entry.borrower_student_id}
                    </p>
                  ) : null}
                  {entry.status === "returned" ? (
                    <p className="mt-2 text-xs text-muted">
                      Student ID cleared from this record after return.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
