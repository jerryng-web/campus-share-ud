import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getCurrentUserId();
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/locker";
  const error = typeof params.error === "string" ? params.error : undefined;

  if (userId) redirect(next);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ud-blue">Log in</h1>
        <p className="mt-2 text-sm text-muted">
          Use the email and password you signed up with after confirming the link in your inbox.
        </p>
      </div>
      <LoginForm next={next} error={error} />
      <p className="text-sm text-muted">
        New to CampusShare?{" "}
        <Link href="/signup" className="font-semibold text-ud-blue underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
