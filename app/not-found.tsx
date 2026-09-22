import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-[var(--line)] bg-white p-8 text-center">
      <h1 className="font-display text-3xl font-semibold text-ud-blue">Listing not found</h1>
      <p className="mt-3 text-muted">That item may have been removed by its owner.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-ud-gold px-5 py-2.5 text-sm font-semibold text-ud-blue-dark">
        Back to Browse
      </Link>
    </div>
  );
}
