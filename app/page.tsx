import { BrowseFilters } from "@/components/browse-filters";
import { ItemCard, type MarketplaceItem } from "@/components/item-card";
import { expireStaleRequests } from "@/app/actions/transactions";
import { getCurrentUserId } from "@/lib/auth";
import { MOCK_LISTINGS } from "@/lib/mock-listings";
import { emptyRating } from "@/lib/ratings";
import { createClient } from "@/lib/supabase/server";

function matchesFilters(item: MarketplaceItem, category: string, complex: string) {
  const categoryOk = category === "all" || item.category === category;
  const complexOk = complex === "all" || item.complex === complex;
  return categoryOk && complexOk;
}

export default async function BrowsePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : "all";
  const complex = typeof params.complex === "string" ? params.complex : "all";
  const userId = await getCurrentUserId();

  let items: MarketplaceItem[] = [];
  let errorMessage: string | null = null;

  if (userId) {
    const supabase = await createClient();
    await expireStaleRequests();
    let query = supabase
      .from("items")
      .select(
        "id, title, description, category, complex, building, status, owner_id, owner:profiles!owner_id(first_name, last_name)",
      )
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (category !== "all") query = query.eq("category", category);
    if (complex !== "all") query = query.eq("complex", complex);

    const { data, error } = await query;
    errorMessage = error?.message ?? null;
    items = await Promise.all(
      (data ?? []).map(async (row) => {
        const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
        const { data: rating } = await supabase.rpc("rating_summary", {
          p_user: row.owner_id,
          p_role: "lender",
        });
        const summary = Array.isArray(rating) ? rating[0] : rating;
        return {
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category,
          complex: row.complex,
          building: row.building,
          status: row.status,
          owner,
          lenderRating: summary
            ? { avg_overall: summary.avg_overall, review_count: summary.review_count }
            : { avg_overall: emptyRating().avg_overall, review_count: 0 },
        };
      }),
    );
  } else {
    items = MOCK_LISTINGS.filter((item) => matchesFilters(item, category, complex));
  }

  return (
    <div>
      <section className="grid grid-cols-1 items-center gap-6 overflow-hidden rounded-3xl bg-ud-blue px-6 py-8 text-white shadow-[0_18px_40px_rgba(0,54,109,0.22)] md:grid-cols-5 sm:px-10">
        <div className="md:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ud-gold">
            University of Delaware
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
            Borrow what you need. Lend what you are not using.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/85">
            CampusShare keeps bulky, once-a-month gear circulating across Laird, East, Central/South,
            and Apartments — so you do not spend closet space or a tight budget on a steamer you need
            once.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ud-gold">
              Hall dashboard
            </p>
            <p className="mt-2 font-display text-2xl leading-snug">Share across campus without buying twice.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-ud-gold px-3 py-3 text-ud-blue-dark">
                <p className="font-display text-2xl font-semibold">4</p>
                <p className="text-xs font-semibold uppercase tracking-wide">Campus areas</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-ud-blue-dark/40 px-3 py-3">
                <p className="font-display text-2xl font-semibold">{userId ? items.length : 6}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Ready nearby</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <BrowseFilters category={category} complex={complex} />
      </div>

      {errorMessage ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <p className="mt-6 text-sm text-muted">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-muted">
          {userId
            ? "Nothing is listed yet for those filters. List your stuff to get the hall marketplace started."
            : "Nothing matches those filters. Try another complex or category."}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} signedIn={Boolean(userId)} />
          ))}
        </div>
      )}
    </div>
  );
}
