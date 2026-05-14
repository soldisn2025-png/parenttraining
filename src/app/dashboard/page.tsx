export const dynamic = "force-dynamic";
export const maxDuration = 30;

import Link from "next/link";
import { listPlans, listProgressRows } from "@/server/store";
import { StatusBadge } from "@/components/status-badge";

export default async function DashboardPage() {
  let plans: Awaited<ReturnType<typeof listPlans>> = [];
  let progressRows: Awaited<ReturnType<typeof listProgressRows>> = [];
  try {
    [plans, progressRows] = await Promise.all([listPlans(), listProgressRows()]);
  } catch {
    // DB unavailable — render empty dashboard rather than crash
  }
  plans = plans.slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
            <p className="mt-2 text-slate-600">Create short weekly plans and see what parents need next.</p>
          </div>
          <Link href="/dashboard/generate" className="min-h-11 rounded-md bg-teal-700 px-4 py-3 font-semibold text-white">
            Generate plan
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Recent plans</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {plans.length === 0 ? (
              <div className="flex flex-col items-start gap-4 px-5 py-10">
                <p className="text-slate-600">No plans yet. Describe a family&apos;s goals and get a ready-to-send video plan.</p>
                <Link href="/dashboard/generate" className="min-h-11 rounded-md bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800">
                  Generate your first plan
                </Link>
              </div>
            ) : (
              plans.map((plan) => (
                <Link key={plan.id} href={`/dashboard/plan/${plan.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-900">{plan.finalVideoOrder.length} video practice plan</div>
                    <div className="text-sm text-slate-500">Generated {new Date(plan.generatedAt).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={plan.reviewStatus} />
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-950">This week</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-md bg-slate-50 p-3">
            <div className="text-2xl font-semibold">{progressRows.length}</div>
            <div className="text-xs text-slate-500">sent</div>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <div className="text-2xl font-semibold">{progressRows.reduce((sum, row) => sum + (row?.watched ?? 0), 0)}</div>
            <div className="text-xs text-slate-500">watched</div>
          </div>
          <div className="rounded-md bg-amber-50 p-3">
            <div className="text-2xl font-semibold text-amber-900">{progressRows.reduce((sum, row) => sum + (row?.needHelp ?? 0), 0)}</div>
            <div className="text-xs text-amber-800">help</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
