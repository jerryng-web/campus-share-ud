export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

export function isValidUsPhone(raw: string) {
  const digits = normalizePhone(raw);
  return digits.length === 10;
}

export function formatPhone(raw?: string | null) {
  if (!raw) return "—";
  const digits = normalizePhone(raw);
  if (digits.length !== 10) return raw;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
