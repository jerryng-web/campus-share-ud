"use client";

import { useRouter } from "next/navigation";
import { CATEGORIES, COMPLEXES } from "@/lib/campus";

export function BrowseFilters({
  category,
  complex,
}: {
  category: string;
  complex: string;
}) {
  const router = useRouter();

  function update(name: string, value: string) {
    const params = new URLSearchParams();
    const nextCategory = name === "category" ? value : category;
    const nextComplex = name === "complex" ? value : complex;
    if (nextCategory && nextCategory !== "all") params.set("category", nextCategory);
    if (nextComplex && nextComplex !== "all") params.set("complex", nextComplex);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  const selectClass =
    "mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-cream px-3 text-sm";

  return (
    <div className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <label className="block text-sm font-medium text-ud-blue">
        Category
        <select
          className={selectClass}
          value={category || "all"}
          onChange={(event) => update("category", event.target.value)}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Campus area
        <select
          className={selectClass}
          value={complex || "all"}
          onChange={(event) => update("complex", event.target.value)}
        >
          <option value="all">All complexes</option>
          {COMPLEXES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <p className="ml-6 flex h-11 items-center text-sm text-muted">
        Listings stay up until the owner removes them.
      </p>
    </div>
  );
}
