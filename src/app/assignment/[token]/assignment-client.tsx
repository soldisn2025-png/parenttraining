"use client";

import { useEffect, useState } from "react";
import type { Video, VideoId } from "@/types/domain";

interface ProgressState {
  watched?: boolean;
  triedIt?: boolean;
  needHelp?: boolean;
}

export function AssignmentClient({
  token,
  videos,
  sentAt,
  firstName,
}: {
  token: string;
  videos: Video[];
  sentAt: string;
  firstName: string;
}) {
  const [progress, setProgress] = useState<Record<string, ProgressState>>({});
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(`walktogether:${token}`);
    // Restores parent progress saved on this device.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (raw) setProgress(JSON.parse(raw));
  }, [token]);

  async function update(videoId: VideoId, patch: ProgressState) {
    const next = { ...progress, [videoId]: { ...progress[videoId], ...patch } };
    setProgress(next);
    localStorage.setItem(`walktogether:${token}`, JSON.stringify(next));
    setUpdatedAt(new Date().toLocaleString());
    await fetch(`/api/assignment/${token}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, ...patch }),
    });
  }

  return (
    <div>
      <header className="no-print sticky top-0 z-10 border-b border-slate-200 bg-[#fbfaf7]/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <div className="text-sm font-semibold text-teal-700">Walktogether</div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Your practice plan</h1>
          <p className="mt-1 text-sm text-slate-600">Prepared by Kelly · Ready {new Date(sentAt).toLocaleDateString()}</p>
          {updatedAt && <p className="mt-1 text-xs text-slate-500">Last updated: {updatedAt}</p>}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="hidden print:block">
          <h1>Walktogether Practice Plan · {new Date(sentAt).toLocaleDateString()}</h1>
          <p>Prepared by Kelly for {firstName}</p>
        </div>
        <p className="rounded-lg bg-teal-50 p-4 text-base leading-7 text-teal-950">
          Start with one video. Try one small thing today. You do not have to be perfect.
        </p>

        <div className="mt-5 space-y-5">
          {videos.map((video) => {
            const state = progress[video.id] ?? {};
            return (
              <article key={video.id} className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{plainModule(video.module)}</div>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{video.title}</h2>
                <p className="mt-1 text-sm text-slate-500">about {video.durationRange.replace("min", "minutes")}</p>
                <p className="mt-3 leading-7 text-slate-700">{video.opening}</p>
                {video.youtubeUrl ? (
                  <a href={video.youtubeUrl} target="_blank" className="no-print mt-4 flex min-h-[52px] w-full items-center justify-center rounded-md bg-teal-700 px-4 py-3 font-semibold text-white">
                    Watch
                  </a>
                ) : (
                  <div className="mt-4 rounded-md bg-slate-100 p-3 text-sm font-semibold text-slate-700">Kelly will show you this one in your next session.</div>
                )}
                <div className="mt-4 rounded-md bg-[#fbfaf7] p-4">
                  <div className="font-semibold text-slate-950">Practice this today:</div>
                  <p className="mt-1 leading-7 text-slate-700">{video.homePractice}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Check label="I watched this" checked={!!state.watched} onChange={(checked) => update(video.id, { watched: checked })} />
                  <Check label="I tried it" checked={!!state.triedIt} onChange={(checked) => update(video.id, { triedIt: checked })} />
                  <Check label="I need help" checked={!!state.needHelp} onChange={(checked) => update(video.id, { needHelp: checked })} />
                </div>
              </article>
            );
          })}
        </div>

        <section className="print-card mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-950">At your next session, tell Kelly:</h2>
          <div className="mt-4 space-y-3 text-slate-700">
            <div>□ Which video was hardest to practice</div>
            <div>□ Any questions you have</div>
            <div>□ One thing your child did well this week</div>
          </div>
        </section>

        <button onClick={() => window.print()} className="no-print mt-6 min-h-[52px] w-full rounded-md border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800">
          Print / Save PDF
        </button>
      </main>
      <footer className="hidden print:block">Bring this sheet to your next session · walktogether - prepared by Kelly</footer>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-[52px] items-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-6 w-6 accent-teal-700" />
      {label}
    </label>
  );
}

function plainModule(module: Video["module"]) {
  return {
    F: "Engagement",
    A: "Everyday words",
    C: "Practice chances",
    T: "Teaching gently",
    S: "Putting it together",
    B: "Extra support",
  }[module];
}
