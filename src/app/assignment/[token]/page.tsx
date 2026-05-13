import { catalog } from "@/data/catalog";
import { getAssignmentByToken, getInvalidAssignmentReason } from "@/server/store";
import { AssignmentClient } from "./assignment-client";

export default async function AssignmentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const assignment = await getAssignmentByToken(token);
  if (!assignment) {
    const reason = await getInvalidAssignmentReason(token);
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">This link is no longer active</h1>
          <p className="mt-3 leading-7 text-slate-600">
            {reason === "updated"
              ? "This plan has been updated. Check your email for your new practice plan."
              : "This link has expired. Ask Kelly for a new one."}
          </p>
        </div>
      </main>
    );
  }

  const assignmentVideos = assignment.plan.finalVideoOrder.map((id) => catalog[id]).filter(Boolean);
  return (
    <AssignmentClient
      token={token}
      videos={assignmentVideos}
      sentAt={assignment.token.sentAt}
      firstName={assignment.contact.firstName}
    />
  );
}
