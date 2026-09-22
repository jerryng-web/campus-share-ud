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
export type TransactionStatus =
  | "pending"
  | "on_loan"
  | "awaiting_inspection"
  | "returned"
  | "denied"
  | "expired"
  | "incident";
export type FlagLevel = "caution" | "beware" | "do_not_recommend";

export function publicDisplayName(firstName?: string | null, lastName?: string | null) {
  const first = (firstName ?? "").trim() || "Student";
  const initial = ((lastName ?? "").trim()[0] || "U").toUpperCase();
  return `${first} ${initial}.`;
}

export function statusLabel(status: string) {
  if (status === "on_loan") return "On Loan";
  if (status === "requested") return "Requested";
  if (status === "pending") return "Pending";
  if (status === "awaiting_inspection") return "Awaiting inspection";
  if (status === "approved") return "On Loan";
  if (status === "denied") return "Denied";
  if (status === "returned") return "Returned";
  if (status === "expired") return "Expired";
  if (status === "incident") return "Lost / damaged / stolen";
  if (status === "overdue") return "Overdue";
  return "Available";
}

export function flagLabel(level?: string | null) {
  if (level === "caution") return "Caution";
  if (level === "beware") return "Beware";
  if (level === "do_not_recommend") return "Do not recommend";
  return null;
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(`${value}T00:00:00`),
    );
  }
  return formatStamp(value);
}

export function hoursSince(value?: string | null) {
  if (!value) return 0;
  return (Date.now() - new Date(value).getTime()) / 36e5;
}

export function isOverdue(status: string, dueAt?: string | null) {
  return status === "on_loan" && Boolean(dueAt) && new Date(dueAt as string).getTime() < Date.now();
}

export function toDatetimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
