"use client";

import { useActionState, useMemo, useState } from "react";
import { createItemAction, type ItemFormState } from "@/app/actions/items";
import { BUILDINGS, CATEGORIES, COMPLEXES } from "@/lib/campus";

const initialState: ItemFormState = {};

export function ListForm() {
  const [state, formAction, pending] = useActionState(createItemAction, initialState);
  const [complex, setComplex] = useState<(typeof COMPLEXES)[number] | "">("");
  const buildings = useMemo(
    () => (complex ? BUILDINGS[complex] : []),
    [complex],
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(0,76,151,0.06)]">
      <label className="block text-sm font-medium text-ud-blue">
        Item name
        <input
          name="title"
          required
          maxLength={80}
          placeholder="Garment steamer, cordless drill…"
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Category
        <select
          name="category"
          required
          defaultValue=""
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5"
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        UD residence complex
        <select
          name="complex"
          required
          value={complex}
          onChange={(event) => setComplex(event.target.value as (typeof COMPLEXES)[number])}
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5"
        >
          <option value="" disabled>
            Select a complex
          </option>
          {COMPLEXES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Building
        <select
          name="building"
          required
          defaultValue=""
          disabled={!complex}
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5 disabled:opacity-60"
        >
          <option value="" disabled>
            {complex ? "Select a building" : "Choose a complex first"}
          </option>
          {buildings.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Description
        <textarea
          name="description"
          required
          rows={4}
          placeholder="What it is, any rules, and how long a typical borrow lasts."
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-ud-blue">
        Pick-up instructions
        <textarea
          name="pickup_instructions"
          rows={3}
          placeholder="Lobby after 5pm, text when you are downstairs…"
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-cream px-3 py-2.5"
        />
      </label>
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ud-gold px-4 py-3 text-sm font-semibold text-ud-blue-dark transition hover:brightness-95 disabled:opacity-70"
      >
        {pending ? "Posting…" : "List this item"}
      </button>
    </form>
  );
}
