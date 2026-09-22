import Link from "next/link";
import {
  AcceptTimesButton,
  CounterTimesForm,
  DeleteListingButton,
  DenyButton,
  ExtensionForm,
  ExtensionHandshake,
  HandBackButton,
  IncidentForm,
  InspectButtons,
  MessageForm,
  ReviewForm,
} from "@/components/locker-actions";
import { requireUserId } from "@/lib/auth";
import {
  flagLabel,
  formatStamp,
  hoursSince,
  isOverdue,
  publicDisplayName,
  statusLabel,
} from "@/lib/campus";
import { formatPhone } from "@/lib/phone";
import { emptyRating, formatStars, type RatingSummary } from "@/lib/ratings";
import { createClient } from "@/lib/supabase/server";
import { expireStaleRequests } from "@/app/actions/transactions";

type ProfileName = { first_name: string; last_name: string } | null;

function asProfile(value: unknown): ProfileName {
  if (Array.isArray(value)) return (value[0] as ProfileName) ?? null;
  return (value as ProfileName) ?? null;
}

async function ratingFor(userId: string, role: "lender" | "borrower"): Promise<RatingSummary> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("rating_summary", { p_user: userId, p_role: role });
  const row = Array.isArray(data) ? data[0] : data;
  return row
    ? {
        review_count: row.review_count ?? 0,
        avg_communication: row.avg_communication,
        avg_condition: row.avg_condition,
        avg_instructions: row.avg_instructions,
        avg_overall: row.avg_overall,
      }
    : emptyRating();
}

export default async function LockerPage() {
  const userId = await requireUserId("/locker");
  await expireStaleRequests();
  const supabase = await createClient();

  const [{ data: borrowing }, { data: lendingItems }, { data: incoming }, { data: messages }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select(
          "*, item:items!item_id(id, title, complex, building, status, purchase_price), lender:profiles!lender_id(first_name, last_name)",
        )
        .eq("borrower_id", userId)
        .order("requested_at", { ascending: false }),
      supabase
        .from("items")
        .select("id, title, status, complex, building, category, purchase_price")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("transactions")
        .select(
          "*, borrower:profiles!borrower_id(first_name, last_name)",
        )
        .eq("lender_id", userId)
        .order("requested_at", { ascending: false }),
      supabase
        .from("transaction_messages")
        .select("id, transaction_id, sender_id, body, created_at")
        .order("created_at", { ascending: true }),
      supabase.from("reviews").select("transaction_id, rater_id").eq("rater_id", userId),
    ]);

  const incomingByItem = new Map<string, NonNullable<typeof incoming>>();
  for (const row of incoming ?? []) {
    const list = incomingByItem.get(row.item_id) ?? [];
    list.push(row);
    incomingByItem.set(row.item_id, list);
  }

  const messagesByTx = new Map<string, NonNullable<typeof messages>>();
  for (const row of messages ?? []) {
    const list = messagesByTx.get(row.transaction_id) ?? [];
    list.push(row);
    messagesByTx.set(row.transaction_id, list);
  }

  const reviewed = new Set((reviews ?? []).map((row) => row.transaction_id));
  const flagCache = new Map<string, string | null>();
  const ratingCache = new Map<string, RatingSummary>();

  async function borrowerMeta(borrowerId: string) {
    if (!flagCache.has(borrowerId)) {
      const { data } = await supabase.rpc("current_borrower_flag", { p_user: borrowerId });
      flagCache.set(borrowerId, data ?? null);
    }
    if (!ratingCache.has(borrowerId)) {
      ratingCache.set(borrowerId, await ratingFor(borrowerId, "borrower"));
    }
    return {
      flag: flagCache.get(borrowerId) ?? null,
      rating: ratingCache.get(borrowerId) ?? emptyRating(),
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ud-blue">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ud-blue">My Locker</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Agree on pickup and return times with the other student. Items leave Browse while a request
          is pending. After a normal return, the owner inspects the item and student ID is erased.
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
                const overdue = isOverdue(row.status, row.due_at);
                const waiting = row.status === "pending" && hoursSince(row.last_activity_at) >= 12;
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
                        {overdue ? "Overdue" : statusLabel(row.status)}
                      </span>
                    </div>
                    {waiting ? (
                      <p className="mt-2 rounded-lg bg-ud-gold/40 px-2 py-1 text-xs font-medium text-ud-blue-dark">
                        Still waiting. This goes back on the market 24 hours after the last update if
                        you do not both accept times.
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-muted">
                      Pickup {formatStamp(row.proposed_pickup_at)} · Return{" "}
                      {formatStamp(row.proposed_return_at)}
                    </p>
                    {row.due_at ? (
                      <p className="text-xs text-muted">Due {formatStamp(row.due_at)}</p>
                    ) : null}
                    {row.status === "pending" ? (
                      <div className="mt-3 space-y-2">
                        {row.lender_accepted_at ? (
                          <p className="text-xs text-muted">Owner accepted the current times.</p>
                        ) : (
                          <p className="text-xs text-muted">Waiting for the owner to accept or send new times.</p>
                        )}
                        {!row.borrower_accepted_at ? <AcceptTimesButton transactionId={row.id} /> : null}
                        <CounterTimesForm
                          transactionId={row.id}
                          pickupAt={row.proposed_pickup_at}
                          returnAt={row.proposed_return_at}
                        />
                      </div>
                    ) : null}
                    {row.status === "on_loan" ? (
                      <div className="mt-3 space-y-2">
                        {overdue ? (
                          <p className="rounded-lg bg-ud-gold/40 px-2 py-1 text-xs font-medium text-ud-blue-dark">
                            Past due. Message the owner or agree on a later return time.
                          </p>
                        ) : null}
                        <HandBackButton transactionId={row.id} />
                        <MessageForm transactionId={row.id} />
                        {overdue ? <ExtensionForm transactionId={row.id} /> : null}
                        <ExtensionHandshake
                          transactionId={row.id}
                          proposedAt={row.extension_return_at}
                          waitingOnYou={Boolean(
                            row.extension_return_at && !row.extension_borrower_accepted_at,
                          )}
                          waitingOnThem={Boolean(
                            row.extension_return_at &&
                              row.extension_borrower_accepted_at &&
                              !row.extension_lender_accepted_at,
                          )}
                        />
                      </div>
                    ) : null}
                    {row.status === "returned" || row.status === "incident" ? (
                      <div className="mt-3">
                        {row.status === "incident" ? (
                          <p className="text-xs font-medium text-red-800">
                            Reported {row.incident_type}. Amount billed: $
                            {Number(row.billed_amount ?? 0).toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted">
                            Inspected {formatStamp(row.inspected_at)} · student ID and request phone cleared
                          </p>
                        )}
                        {!reviewed.has(row.id) ? (
                          <ReviewForm transactionId={row.id} role="borrower" />
                        ) : (
                          <p className="mt-2 text-xs text-muted">You already submitted a rating.</p>
                        )}
                      </div>
                    ) : null}
                    <MessageList rows={messagesByTx.get(row.id) ?? []} userId={userId} />
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
              await Promise.all(
                (lendingItems ?? []).map(async (item) => {
                  const requests = incomingByItem.get(item.id) ?? [];
                  return (
                    <article key={item.id} className="rounded-2xl bg-cream p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-ud-blue">{item.title}</h3>
                          <p className="text-sm text-muted">
                            {item.complex} — {item.building}
                          </p>
                          <p className="text-xs text-muted">
                            Purchase price ${Number(item.purchase_price).toFixed(2)}
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
                          await Promise.all(
                            requests.map(async (request) => {
                              const borrower = asProfile(request.borrower);
                              const meta = await borrowerMeta(request.borrower_id);
                              const overdue = isOverdue(request.status, request.due_at);
                              const waiting =
                                request.status === "pending" && hoursSince(request.last_activity_at) >= 12;
                              return (
                                <div key={request.id} className="rounded-xl border border-[var(--line)] bg-white p-3">
                                  <p className="text-sm font-medium text-ud-blue">
                                    {publicDisplayName(borrower?.first_name, borrower?.last_name)} ·{" "}
                                    {overdue ? "Overdue" : statusLabel(request.status)}
                                  </p>
                                  <p className="text-xs text-muted">
                                    Borrowing rating: {formatStars(meta.rating.avg_overall)}
                                    {meta.flag ? ` · ${flagLabel(meta.flag)}` : ""}
                                  </p>
                                  {waiting ? (
                                    <p className="mt-2 rounded-lg bg-ud-gold/40 px-2 py-1 text-xs font-medium text-ud-blue-dark">
                                      Still processing. Agree on times within 24 hours or this listing
                                      returns to Browse.
                                    </p>
                                  ) : null}
                                  <p className="mt-1 text-xs text-muted">
                                    Pickup {formatStamp(request.proposed_pickup_at)} · Return{" "}
                                    {formatStamp(request.proposed_return_at)}
                                  </p>
                                  {request.request_message ? (
                                    <p className="mt-2 text-sm leading-6">{request.request_message}</p>
                                  ) : null}
                                  {request.borrower_phone ? (
                                    <p className="mt-2 rounded-lg bg-ud-gold/30 px-2 py-1 text-xs font-medium text-ud-blue-dark">
                                      Call {formatPhone(request.borrower_phone)} if something is wrong.
                                    </p>
                                  ) : null}
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
                                      {!request.lender_accepted_at ? (
                                        <AcceptTimesButton transactionId={request.id} />
                                      ) : (
                                        <p className="text-xs text-muted">You accepted. Waiting on the borrower.</p>
                                      )}
                                      <DenyButton transactionId={request.id} />
                                    </div>
                                  ) : null}
                                  {request.status === "pending" ? (
                                    <CounterTimesForm
                                      transactionId={request.id}
                                      pickupAt={request.proposed_pickup_at}
                                      returnAt={request.proposed_return_at}
                                    />
                                  ) : null}
                                  {request.status === "on_loan" ? (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-xs text-muted">Due {formatStamp(request.due_at)}</p>
                                      {overdue ? (
                                        <p className="rounded-lg bg-ud-gold/40 px-2 py-1 text-xs font-medium text-ud-blue-dark">
                                          Past due. Call or send a message to extend. If it is lost,
                                          damaged, or stolen, bill the listing purchase price and flag
                                          the borrower.
                                        </p>
                                      ) : null}
                                      <HandBackButton transactionId={request.id} />
                                      <MessageForm transactionId={request.id} />
                                      {overdue ? (
                                        <>
                                          <ExtensionForm transactionId={request.id} />
                                          <ExtensionHandshake
                                            transactionId={request.id}
                                            proposedAt={request.extension_return_at}
                                            waitingOnYou={Boolean(
                                              request.extension_return_at &&
                                                !request.extension_lender_accepted_at,
                                            )}
                                            waitingOnThem={Boolean(
                                              request.extension_return_at &&
                                                request.extension_lender_accepted_at &&
                                                !request.extension_borrower_accepted_at,
                                            )}
                                          />
                                          <IncidentForm
                                            transactionId={request.id}
                                            purchasePrice={Number(item.purchase_price ?? 0)}
                                          />
                                        </>
                                      ) : null}
                                    </div>
                                  ) : null}
                                  {request.status === "awaiting_inspection" ? (
                                    <div className="mt-3">
                                      <InspectButtons transactionId={request.id} itemId={item.id} />
                                    </div>
                                  ) : null}
                                  {request.status === "returned" || request.status === "incident" ? (
                                    <div className="mt-3">
                                      {request.status === "incident" ? (
                                        <p className="text-xs font-medium text-red-800">
                                          {request.incident_type} · billed $
                                          {Number(request.billed_amount ?? 0).toFixed(2)}
                                        </p>
                                      ) : null}
                                      {!reviewed.has(request.id) ? (
                                        <ReviewForm transactionId={request.id} role="lender" />
                                      ) : (
                                        <p className="text-xs text-muted">You already submitted a rating.</p>
                                      )}
                                    </div>
                                  ) : null}
                                  <MessageList
                                    rows={messagesByTx.get(request.id) ?? []}
                                    userId={userId}
                                  />
                                </div>
                              );
                            }),
                          )
                        )}
                      </div>
                    </article>
                  );
                }),
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MessageList({
  rows,
  userId,
}: {
  rows: { id: string; sender_id: string; body: string; created_at: string }[];
  userId: string;
}) {
  if (!rows.length) return null;
  return (
    <ul className="mt-3 space-y-1">
      {rows.map((row) => (
        <li key={row.id} className="text-xs text-muted">
          <span className="font-semibold text-ud-blue">
            {row.sender_id === userId ? "You" : "Them"}:
          </span>{" "}
          {row.body}{" "}
          <span className="text-[10px]">{formatStamp(row.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
