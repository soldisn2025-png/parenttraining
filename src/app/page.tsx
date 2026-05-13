import Link from "next/link";
import { WalktogetherLogo } from "@/components/walktogether-logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <WalktogetherLogo />
        <div className="mt-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">ABA parent training, simplified</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
            Build a parent video plan in seconds. Review, approve, send.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            Describe what a family is working on. Walktogether picks the right videos, writes the weekly guidance, and sends it directly to the parent.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="min-h-11 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">
              Open dashboard
            </Link>
            <Link href="/dashboard/catalog" className="min-h-11 rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-white">
              Browse catalog
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
