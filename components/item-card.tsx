"use client";

import { RequestGate } from "@/components/request-gate";
import { categoryIcon, publicDisplayName, statusLabel } from "@/lib/campus";
import { formatStars } from "@/lib/ratings";

export type MarketplaceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  complex: string;
  building: string;
  status: string;
  owner: {
    first_name: string;
    last_name: string;
  } | null;
  lenderRating?: {
    avg_overall: number | null;
    review_count: number;
  };
};

export function ItemCard({
  item,
  signedIn,
}: {
  item: MarketplaceItem;
  signedIn: boolean;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_30px_rgba(0,76,151,0.06)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-2xl" aria-hidden>
          {categoryIcon(item.category)}
        </span>
        <span className="rounded-full bg-ud-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ud-blue-dark">
          {item.category}
        </span>
      </div>
      <h2 className="font-display text-xl font-semibold text-ud-blue">{item.title}</h2>
      <p className="mt-2 text-sm text-muted">
        {item.complex} — {item.building}
      </p>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-ink/80">{item.description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Lender: {publicDisplayName(item.owner?.first_name, item.owner?.last_name)}
        </p>
        <span className="text-xs font-semibold uppercase tracking-wide text-ud-blue">
          {statusLabel(item.status)}
        </span>
      </div>
      {item.lenderRating ? (
        <p className="mt-1 text-xs text-muted">
          Lending rating: {formatStars(item.lenderRating.avg_overall)}
          {item.lenderRating.review_count
            ? ` · ${item.lenderRating.review_count} recent`
            : ""}
        </p>
      ) : null}
      <RequestGate signedIn={signedIn} href={`/items/${item.id}`} />
    </article>
  );
}
