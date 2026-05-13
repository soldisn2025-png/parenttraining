"use client";

import { useState } from "react";
import Link from "next/link";
import type { GeneratedPlan } from "@/types/domain";

const messages = ["Reading your prompt...", "Matching videos to your goals...", "Writing the practice plan...", "Almost there - this one's taking a moment..."];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setLoading(true);
    setMessageIndex(0);
    const timer = setInterval(() => setMessageIndex((value) => Math.min(value + 1, messages.length - 1)), 3000);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not generate plan");
      setPlan(data.plan);
      localStorage.setItem("walktogether:lastPlanId", data.plan.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate plan");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,680px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Create a parent training plan</h1>
        <p className="mt-2 text-slate-600">Describe what is hard, where it happens, and what parent support would help. No names or dates needed.</p>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value.slice(0, 500))}
          className="mt-6 min-h-48 w-full rounded-md border border-slate-300 p-4 text-base outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          placeholder="e.g. Child grabs toys instead of asking. Parent struggles with mealtime routines. Looking for beginner strategies."
        />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
          <span>No names, dates, or diagnosis details.</span>
          <span>{prompt.length} / 500</span>
        </div>
        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        <button
          onClick={submit}
          disabled={loading || prompt.trim().length === 0}
          className="mt-5 min-h-11 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? messages[messageIndex] : "Generate plan ->"}
        </button>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-950">Result</h2>
        {plan ? (
          <div className="mt-4">
            <div className="rounded-md bg-teal-50 p-4 text-teal-950">
              Created a {plan.finalVideoOrder.length}-video draft. Kelly can review, edit, approve, and send it.
            </div>
            <Link href={`/dashboard/plan/${plan.id}`} className="mt-4 inline-flex min-h-11 items-center rounded-md bg-slate-950 px-4 py-3 font-semibold text-white">
              Review plan
            </Link>
            <p className="mt-3 text-sm text-slate-600">
              Need to add a contact first? This plan is saved. You can find it again from the dashboard recent plans list.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm leading-6 text-slate-600">Generated plans will appear here after the deterministic matcher and rationale writer finish.</p>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              View recent plans
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
