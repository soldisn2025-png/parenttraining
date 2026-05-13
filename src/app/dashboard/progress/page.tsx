export const dynamic = "force-dynamic";

import { listProgressRows } from "@/server/store";

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.max(0, Math.floor(diff / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default async function ProgressPage() {
  const rows = await listProgressRows();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Weekly progress</h1>
      <p className="mt-2 text-slate-600">Refreshes on page load. Need-help flags are the priority for follow-up.</p>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Parent name</th>
              <th className="px-4 py-3">Plan sent</th>
              <th className="px-4 py-3">Videos assigned</th>
              <th className="px-4 py-3">Watched</th>
              <th className="px-4 py-3">Tried</th>
              <th className="px-4 py-3">Need help</th>
              <th className="px-4 py-3">Last active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-slate-600">
                  No sent assignments yet.
                </td>
              </tr>
            ) : (
              rows.map((row) =>
                row ? (
                  <tr key={row.token.id}>
                    <td className="px-4 py-3 font-semibold text-slate-950">{row.contact.firstName}</td>
                    <td className="px-4 py-3">{new Date(row.token.sentAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{row.plan.finalVideoOrder.length}</td>
                    <td className="px-4 py-3">{row.watched}</td>
                    <td className="px-4 py-3">{row.tried}</td>
                    <td className="px-4 py-3">
                      <span className={row.needHelp > 0 ? "rounded-full bg-red-100 px-2 py-1 font-semibold text-red-700" : ""}>{row.needHelp}</span>
                    </td>
                    <td className="px-4 py-3">{relativeTime(row.lastActive)}</td>
                  </tr>
                ) : null
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
