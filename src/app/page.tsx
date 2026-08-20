import Link from "next/link";

const actions = [
  {
    href: "/projects/new",
    number: "01",
    title: "Create New Project",
    copy: "Start the mandatory project information form after a GDS Job Code is assigned.",
    cta: "Open project form",
  },
  {
    href: "/projects/active",
    number: "02",
    title: "Active Projects",
    copy: "Find active GDS Job Codes and open their basic project overviews.",
    cta: "View active projects",
  },
  {
    href: "/projects/archived",
    number: "03",
    title: "Archived Projects",
    copy: "View the prototype archive area without defining an archive workflow.",
    cta: "View archive placeholder",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="panel overflow-hidden">
        <div className="border-l-4 border-[#2463a9] px-6 py-10 md:px-10 md:py-14">
          <p className="eyebrow">Global Display Systems</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-.035em] text-slate-900 md:text-5xl">
            GDS ERP
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            A focused visual prototype for creating, locating, and reviewing GDS
            project records.
          </p>
        </div>
      </section>
      <section
        className="mt-7 grid gap-4 lg:grid-cols-3"
        aria-label="Primary actions"
      >
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="panel group flex min-h-64 flex-col p-6 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <span className="text-xs font-bold tracking-widest text-blue-700">
              {action.number}
            </span>
            <h2 className="mt-8 text-xl font-bold">{action.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {action.copy}
            </p>
            <span className="mt-auto pt-8 text-sm font-bold text-[#173f73]">
              {action.cta} <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
