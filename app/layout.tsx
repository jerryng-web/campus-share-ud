import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile, getCurrentUserId } from "@/lib/auth";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusShare UD",
  description:
    "Borrow and lend items across University of Delaware residence complexes.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [profile, userId] = await Promise.all([getCurrentProfile(), getCurrentUserId()]);

  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <SiteHeader
          user={
            profile
              ? { first_name: profile.first_name, last_name: profile.last_name }
              : userId
                ? { first_name: "Student", last_name: "U" }
                : null
          }
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-[var(--line)] bg-ud-blue px-4 py-6 text-center text-sm text-white/85">
          CampusShare UD · Listings stay up until you remove them · Student IDs are erased when an
          item is marked returned
        </footer>
      </body>
    </html>
  );
}
