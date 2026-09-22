export const CATEGORIES = [
  "Electronics",
  "Appliances",
  "Tools",
  "Kitchen",
  "Other",
] as const;

export const COMPLEXES = [
  "Laird Campus Suites",
  "East Campus Traditional",
  "Central/South Campus",
  "Apartments",
] as const;

export const BUILDINGS: Record<(typeof COMPLEXES)[number], string[]> = {
  "Laird Campus Suites": [
    "George Read",
    "Independence",
    "James Smith",
    "Thomas McKean",
  ],
  "East Campus Traditional": [
    "Caesar Rodney",
    "Eliphalet Gilbert",
    "Harrington A–E",
    "Lane",
    "Louis L. Redding",
    "Russell A–D",
  ],
  "Central/South Campus": [
    "North Central",
    "South Central",
    "Smyth",
    "South Academy",
    "Ray Street A–B",
  ],
  Apartments: ["University Courtyard", "Graduate Student Housing"],
};

export const CATEGORY_ICONS: Record<(typeof CATEGORIES)[number], string> = {
  Electronics: "🔌",
  Appliances: "🧺",
  Tools: "🔧",
  Kitchen: "🍳",
  Other: "📦",
};

export type ItemStatus = "available" | "requested" | "on_loan";
export type TransactionStatus = "pending" | "approved" | "denied" | "returned";

export function publicDisplayName(firstName?: string | null, lastName?: string | null) {
  const first = (firstName ?? "").trim() || "Student";
  const initial = ((lastName ?? "").trim()[0] || "U").toUpperCase();
  return `${first} ${initial}.`;
}

export function statusLabel(status: string) {
  if (status === "on_loan") return "On Loan";
  if (status === "requested") return "Requested";
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  if (status === "denied") return "Denied";
  if (status === "returned") return "Returned";
  return "Available";
}

export function categoryIcon(category: string) {
  return CATEGORY_ICONS[category as (typeof CATEGORIES)[number]] ?? "📦";
}

export function formatStamp(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );
}
