import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-[var(--line)] bg-white p-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ud-gold">Almost there</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ud-blue">Check your email</h1>
      <p className="mt-4 leading-7 text-muted">
        We sent a confirmation link to finish creating your CampusShare UD account. Open that email,
        confirm your address, then come back to log in.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-flex rounded-full bg-ud-gold px-5 py-2.5 text-sm font-semibold text-ud-blue-dark"
      >
        Go to log in
      </Link>
    </div>
  );
}
