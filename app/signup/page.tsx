import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth-forms";
import { getCurrentUserId } from "@/lib/auth";

export default async function SignupPage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/locker");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ud-blue">Create your account</h1>
        <p className="mt-2 text-sm text-muted">
          Sign up with email and password. We will send a confirmation link before you can log in.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ud-blue underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
