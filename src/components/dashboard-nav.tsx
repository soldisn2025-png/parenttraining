import Link from "next/link";
import { WalktogetherLogo } from "@/components/walktogether-logo";

const links = [
  ["Dashboard", "/dashboard"],
  ["Generate", "/dashboard/generate"],
  ["Catalog", "/dashboard/catalog"],
  ["Contacts", "/dashboard/contacts"],
  ["Progress", "/dashboard/progress"],
];

export function DashboardNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/dashboard" className="w-fit">
          <WalktogetherLogo />
        </Link>
        <nav className="flex flex-wrap gap-2">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="min-h-11 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
