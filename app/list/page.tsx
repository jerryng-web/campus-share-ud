import { ListForm } from "@/components/list-form";
import { requireUserId } from "@/lib/auth";

export default async function ListPage() {
  await requireUserId("/list");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ud-blue">
          Share your extra gear
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ud-blue">List Your Stuff</h1>
        <p className="mt-3 leading-7 text-muted">
          Post an item hallmates can borrow. It stays on Browse until you remove it from My Locker.
        </p>
      </div>
      <ListForm />
    </div>
  );
}
