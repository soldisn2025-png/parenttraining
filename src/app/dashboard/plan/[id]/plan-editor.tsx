"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import type { GeneratedPlan, Video } from "@/types/domain";

interface Contact {
  id: string;
  firstName: string;
  email: string;
}

export function PlanEditor({ initialPlan, videos, contacts }: { initialPlan: GeneratedPlan; videos: Video[]; contacts: Contact[] }) {
  const [plan, setPlan] = useState(initialPlan);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [sendUrl, setSendUrl] = useState("");
  const videoMap = useMemo(() => new Map(videos.map((video) => [video.id, video])), [videos]);
  const orderedVideos = plan.finalVideoOrder.map((id) => videoMap.get(id)).filter(Boolean) as Video[];
  const canEdit = plan.reviewStatus !== "approved" && plan.reviewStatus !== "sent";

  async function patch(body: unknown) {
    const response = await fetch(`/api/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (response.ok) setPlan(data.plan);
    else alert(data.error ?? "Could not update plan");
  }

  async function send() {
    const response = await fetch(`/api/plans/${plan.id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });
    const data = await response.json();
    if (response.ok) {
      setSendUrl(data.assignmentUrl);
      setPlan(data.sent ? { ...plan, reviewStatus: "sent", parentAssignmentToken: data.sent.token.token } : plan);
    } else {
      alert(data.error ?? "Could not send");
    }
  }

  const filtered = videos.filter((video) => {
    const haystack = `${video.title} ${video.keyPoints.join(" ")} ${video.targetSkillTags.join(" ")} ${video.routineTags.join(" ")} ${video.opening}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Practice plan</h1>
              <p className="mt-2 text-slate-600">
                {plan.systemSelectedVideos.length} system-selected · {plan.manuallyAddedVideos.length} added · {plan.manuallyRemovedVideos.length} removed
              </p>
            </div>
            <StatusBadge status={plan.reviewStatus} />
          </div>

          <div className="mt-6 space-y-4">
            {orderedVideos.map((video, index) => (
              <article key={video.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{video.id} · {video.durationRange}</div>
                    <h2 className="mt-1 font-semibold text-slate-950">{video.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{video.homePractice}</p>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={!canEdit || index === 0} onClick={() => {
                      const next = [...plan.finalVideoOrder];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      void patch({ action: "reorder", finalVideoOrder: next });
                    }} className="min-h-11 rounded-md border px-3 text-sm font-semibold disabled:opacity-40">Up</button>
                    <button disabled={!canEdit || index === orderedVideos.length - 1} onClick={() => {
                      const next = [...plan.finalVideoOrder];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      void patch({ action: "reorder", finalVideoOrder: next });
                    }} className="min-h-11 rounded-md border px-3 text-sm font-semibold disabled:opacity-40">Down</button>
                    <button disabled={!canEdit} onClick={() => patch({ action: "remove", videoId: video.id })} className="min-h-11 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-40">
                      X Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            disabled={!canEdit || plan.finalVideoOrder.length >= 5}
            onClick={() => setModalOpen(true)}
            className="mt-5 min-h-11 rounded-md bg-slate-950 px-4 py-3 font-semibold text-white disabled:bg-slate-300"
          >
            + Add Video
          </button>
          {plan.finalVideoOrder.length >= 5 && <p className="mt-2 text-sm font-semibold text-amber-700">Plan is at 5 videos - remove one to swap it for another.</p>}

          <label className="mt-6 block text-sm font-semibold text-slate-700">Rationale</label>
          <textarea value={plan.rationale} disabled={!canEdit} onChange={(event) => setPlan({ ...plan, rationale: event.target.value })} className="mt-2 min-h-36 w-full rounded-md border border-slate-300 p-3" />
          <button disabled={!canEdit} onClick={() => patch({ action: "rationale", rationale: plan.rationale })} className="mt-3 min-h-11 rounded-md border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40">
            Save rationale
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-950">Finalize and send</h2>
          <div className="mt-4 space-y-3">
            {contacts.length > 0 ? (
              <select value={contactId} onChange={(event) => setContactId(event.target.value)} className="min-h-11 w-full rounded-md border border-slate-300 px-3">
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.firstName} · {contact.email}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-slate-600">Add a contact before sending.</p>
            )}
            {plan.reviewStatus === "approved" ? (
              <button onClick={send} disabled={!contactId} className="min-h-11 w-full rounded-md bg-teal-700 px-4 py-3 font-semibold text-white disabled:bg-slate-300">
                Send assignment
              </button>
            ) : plan.reviewStatus === "sent" ? (
              <div className="rounded-md bg-sky-50 p-3 text-sm text-sky-900">Sent. {sendUrl && <a className="underline" href={sendUrl}>Open parent link</a>}</div>
            ) : (
              <button onClick={() => patch({ action: "approve" })} className="min-h-11 w-full rounded-md bg-emerald-700 px-4 py-3 font-semibold text-white">
                Finalize Plan
              </button>
            )}
            {plan.reviewStatus === "approved" && (
              <button onClick={() => patch({ action: "reopen" })} className="min-h-11 w-full rounded-md border border-slate-300 px-4 py-3 font-semibold">
                Reopen for editing
              </button>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-950">Plan history</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div>Generated by system - {plan.systemSelectedVideos.length} videos selected</div>
            {plan.overrideLog.map((event, index) => (
              <div key={`${event.timestamp}-${index}`}>* {event.action.replaceAll("_", " ")} {event.videoId ?? ""}</div>
            ))}
          </div>
        </div>
      </aside>

      {modalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="video-search-title" className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto max-h-[90vh] max-w-3xl overflow-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 id="video-search-title" className="text-xl font-semibold">Add video</h2>
              <button onClick={() => setModalOpen(false)} className="min-h-11 rounded-md border px-3 font-semibold">Close</button>
            </div>
            <input autoFocus value={query} onKeyDown={(event) => event.key === "Escape" && setModalOpen(false)} onChange={(event) => setQuery(event.target.value)} className="mt-4 min-h-11 w-full rounded-md border border-slate-300 px-3" placeholder="Search title, tags, or key points" />
            <div className="mt-4 space-y-3">
              {filtered.map((video) => {
                const alreadyAdded = plan.finalVideoOrder.includes(video.id);
                const match = plan.systemScoresByVideoId[video.id];
                return (
                  <div key={video.id} className="rounded-md border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{video.id} · Match: {typeof match === "number" ? `${Math.round(match * 100)}%` : "-"}</div>
                        <div className="font-semibold text-slate-950">{video.title}</div>
                      </div>
                      <button disabled={alreadyAdded || plan.finalVideoOrder.length >= 5} onClick={() => patch({ action: "add", videoId: video.id })} className="min-h-11 rounded-md bg-teal-700 px-4 py-2 font-semibold text-white disabled:bg-slate-300">
                        {alreadyAdded ? "Already added" : "Add to Plan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
