import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel mx-auto max-w-xl p-8 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="mt-3 text-2xl font-bold">Project record unavailable</h1>
      <p className="mt-3 text-sm text-slate-600">
        This local prototype contains only its fictional mock records.
      </p>
      <Link href="/projects/active" className="button button-primary mt-6">
        Back to Active Projects
      </Link>
    </div>
  );
}
