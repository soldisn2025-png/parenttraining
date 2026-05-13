import { videos } from "@/data/catalog";

const moduleNames = {
  F: "Focus",
  A: "Adjust",
  C: "Create",
  T: "Teach",
  S: "Shape",
  B: "Bonus",
};

export default function CatalogPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Video catalog</h1>
      <p className="mt-2 text-slate-600">45 videos planned across the Walktogether parent training curriculum. First batch in production.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <article key={video.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                  {moduleNames[video.module]} · {video.id}
                </div>
                <h2 className="mt-2 font-semibold leading-snug text-slate-950">{video.title}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">Planned</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{video.opening}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {video.targetSkillTags.map((tag) => (
                <span key={tag} className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
