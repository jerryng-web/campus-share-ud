import Link from "next/link";
import {
  ApproveButton,
  DeleteListingButton,
  DenyButton,
  ReturnButton,
} from "@/components/locker-actions";
import { requireUserId } from "@/lib/auth";
import { formatDate, formatStamp, publicDisplayName, statusLabel } from "@/lib/campus";
import { createClient } from "@/lib/supabase/server";

export default async function LockerPage() {
  const userId = await requireUserId("/locker");
  const supabase = await createClient();

  const [{ data: borrowing }, { data: lendingItems }, { data: incoming }] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        "id, status, start_date, end_date, requested_at, approved_at, completed_at, borrower_student_id, item:items!item_id(id, title, complex, building, status)",
      )
      .eq("borrower_id", userId)
      .order("requested_at", { ascending: false }),
    supabase
      .from("items")
      .select("id, title, status, complex, building, category")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select(
        "id, item_id, status, start_date, end_date, requested_at, approved_at, completed_at, borrower_student_id, borrower:profiles!borrower_id(first_name, last_name)",
      )
      .eq("lender_id", userId)
      .order("requested_at", { ascending: false }),
  ]);

  const incomingByItem = new Map<string, NonNullable<typeof incoming>>();
  for (const row of incoming ?? []) {
    const list = incomingByItem.get(row.item_id) ?? [];
    list.push(row);
    incomingByItem.set(row.item_id, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ud-blue">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ud-blue">My Locker</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Track what you are borrowing and lending. Approving a request logs the borrower&apos;s
          student ID until the item is marked returned — then that ID is permanently erased.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-[var(--line)] bg-white p-6">
          <h2 className="font-display text-xl text-ud-blue">Items I am borrowing</h2>
          <div className="mt-4 space-y-4">
            {(borrowing ?? []).length === 0 ? (
              <p className="text-sm text-muted">
                You have not requested anything yet.{" "}
                <Link href="/" className="font-semibold text-ud-blue underline">
                  Browse items
                </Link>
                .
              </p>
            ) : (
              (borrowing ?? []).map((row) => {
                const item = Array.isArray(row.item) ? row.item[0] : row.item;
                return (
                  <article key={row.id} className="rounded-2xl bg-cream p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-ud-blue">{item?.title ?? "Item"}</h3>
                        <p className="text-sm text-muted">
                          {item?.complex} — {item?.building}
                        </p>
                      </div>
                      <span className="rounded-full bg-ud-gold px-3 py-1 text-xs font-semibold uppercase text-ud-blue-dark">
                        {statusLabel(row.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {formatDate(row.start_date)} to {formatDate(row.end_date)}
                    </p>
                    <p className="text-xs text-muted">Requested {formatStamp(row.requested_at)}</p>
                    {row.status === "approved" ? (
                      <div className="mt-3">
                        <ReturnButton transactionId={row.id} />
                      </div>
                    ) : null}
                    {row.status === "returned" ? (
                      <p className="mt-2 text-xs text-muted">
                        Returned {formatStamp(row.completed_at)} · student ID cleared
                      </p>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--line)] bg-white p-6">
          <h2 className="font-display text-xl text-ud-blue">Items I am lending</h2>
          <div className="mt-4 space-y-4">
            {(lendingItems ?? []).length === 0 ? (
              <p className="text-sm text-muted">
                You have not listed anything yet.{" "}
                <Link href="/list" className="font-semibold text-ud-blue underline">
                  List your stuff
                </Link>
                .
              </p>
            ) : (
              (lendingItems ?? []).map((item) => {
                const requests = incomingByItem.get(item.id) ?? [];
                return (
                  <article key={item.id} className="rounded-2xl bg-cream p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-ud-blue">{item.title}</h3>
                        <p className="text-sm text-muted">
                          {item.complex} — {item.building}
                        </p>
                      </div>
                      <span className="rounded-full bg-ud-gold px-3 py-1 text-xs font-semibold uppercase text-ud-blue-dark">
                        {statusLabel(item.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/items/${item.id}`}
                        className="rounded-full bg-ud-blue px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        Open listing
                      </Link>
                      <DeleteListingButton itemId={item.id} />
                    </div>
                    <div className="mt-4 space-y-3">
                      {requests.length === 0 ? (
                        <p className="text-sm text-muted">No requests yet.</p>
                      ) : (
                        requests.map((request) => {
                          const borrower = Array.isArray(request.borrower)
                            ? request.borrower[0]
                            : request.borrower;
                          return (
                            <div key={request.id} className="rounded-xl border border-[var(--line)] bg-white p-3">
                              <p className="text-sm font-medium text-ud-blue">
                                {publicDisplayName(borrower?.first_name, borrower?.last_name)} ·{" "}
                                {statusLabel(request.status)}
                              </p>
                              <p className="text-xs text-muted">
                                {formatDate(request.start_date)} to {formatDate(request.end_date)} ·
                                requested {formatStamp(request.requested_at)}
                              </p>
                              {request.borrower_student_id ? (
                                <p className="mt-2 rounded-lg bg-ud-gold/30 px-2 py-1 text-xs font-medium text-ud-blue-dark">
                                  Student ID on file: {request.borrower_student_id}
                                </p>
                              ) : request.status === "returned" ? (
                                <p className="mt-2 text-xs text-muted">
                                  Returned {formatStamp(request.completed_at)} · student ID erased
                                </p>
                              ) : null}
                              {request.status === "pending" ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <ApproveButton transactionId={request.id} />
                                  <DenyButton transactionId={request.id} />
                                </div>
                              ) : null}
                              {request.status === "approved" ? (
                                <div className="mt-3">
                                  <ReturnButton transactionId={request.id} />
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
