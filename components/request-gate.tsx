"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

const ctaClass =
  "mt-5 inline-flex w-full items-center justify-center rounded-full bg-ud-gold px-4 py-2.5 text-sm font-semibold text-ud-blue-dark transition hover:brightness-95";

export function RequestGate({
  signedIn,
  href,
  label = "Request to Borrow",
}: {
  signedIn: boolean;
  href: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (signedIn) {
    return (
      <Link href={href} className={ctaClass}>
        {label}
      </Link>
    );
  }

  return (
    <>
      <button type="button" className={ctaClass} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ud-blue/55 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(0,54,109,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ud-gold">
              UD account required
            </p>
            <h2 id={titleId} className="mt-2 font-display text-2xl font-semibold text-ud-blue">
              Sign in to request this item
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              You must be signed in with your UD account to request items. Please log in or sign up
              to continue.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?next=/"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-ud-gold px-4 py-2.5 text-sm font-semibold text-ud-blue-dark"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-ud-blue px-4 py-2.5 text-sm font-semibold text-white"
              >
                Sign up
              </Link>
            </div>
            <button
              type="button"
              className="mt-4 w-full text-sm font-medium text-muted hover:text-ud-blue"
              onClick={() => setOpen(false)}
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
