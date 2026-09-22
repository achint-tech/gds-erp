import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects/new", label: "Create Project" },
  { href: "/projects/active", label: "Active Projects" },
  { href: "/projects/archived", label: "Archived" },
  { href: "/purchase", label: "Purchase" },
  { href: "/store", label: "Store / Inventory" },
  { href: "/production", label: "Production" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="GDS ERP home"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-[#173f73] text-sm font-bold text-white">
              GDS
            </span>
            <span>
              <strong className="block text-sm tracking-wide">GDS ERP</strong>
              <span className="block text-xs text-slate-500">
                Project operations
              </span>
            </span>
          </Link>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
            Internal Project Management
          </span>
        </div>
        <nav
          className="mx-auto flex max-w-[1500px] gap-1 overflow-x-auto px-5 pb-3 lg:px-8"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8 lg:py-10">
        {children}
      </main>
      <footer className="mx-auto max-w-[1500px] px-5 py-7 text-xs text-slate-500 lg:px-8">
        GDS ERP · Internal Project Management
      </footer>
    </div>
  );
}
