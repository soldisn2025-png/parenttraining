import type { ReviewStatus } from "@/types/domain";

const styles: Record<ReviewStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  revised: "bg-amber-100 text-amber-900 border-amber-300",
  approved: "bg-emerald-100 text-emerald-900 border-emerald-300",
  sent: "bg-sky-100 text-sky-900 border-sky-300",
};

const labels: Record<ReviewStatus, string> = {
  draft: "Draft",
  revised: "Edited - review before sending",
  approved: "Ready to send",
  sent: "Sent",
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  return <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${styles[status]}`}>{labels[status]}</span>;
}
