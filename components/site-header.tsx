"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { publicDisplayName } from "@/lib/campus";

type HeaderUser = {
  first_name: string;
  last_name: string;
} | null;

const signedInLinks = [
  { href: "/", label: "Browse" },
  { href: "/list", label: "List Your Stuff" },
  { href: "/locker", label: "My Locker" },
];

function navClass(active: boolean) {
  return `rounded-full px-3 py-2 text-sm font-medium transition ${
    active ? "bg-ud-gold text-ud-blue-dark" : "text-white/90 hover:bg-white/10"
  }`;
}

export function SiteHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-30 border-b border-ud-gold/35 bg-ud-blue text-white shadow-[0_8px_24px_rgba(0,54,109,0.18)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link href="/" className="font-display shrink-0 text-2xl font-bold tracking-tight sm:text-3xl">
            CampusShare <span className="text-ud-gold">UD</span>
          </Link>
          {user ? (
            <>
              <button
                type="button"
                className="rounded-full border border-ud-gold/50 px-3 py-1.5 text-sm text-ud-gold md:hidden"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? "Close" : "Menu"}
              </button>
              <nav
                className={`${open ? "absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-ud-gold/35 bg-ud-blue px-4 py-3" : "hidden"} md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:px-0 md:py-0`}
              >
                {signedInLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={navClass(pathname === link.href)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </>
          ) : (
            <Link
              href="/"
              className="px-1 text-sm font-medium text-white/90 hover:text-white"
            >
              Browse
            </Link>
          )}
        </div>

        {user ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-sm text-ud-gold-soft sm:inline">
              {publicDisplayName(user.first_name, user.last_name)}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/25 px-3 py-1.5 text-sm hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-ud-gold px-4 py-2 text-sm font-semibold text-ud-blue-dark"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
