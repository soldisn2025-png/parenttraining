export function WalktogetherLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 64 64" className="h-11 w-11">
        <circle cx="32" cy="32" r="30" fill="#F7F3EA" />
        <path
          d="M18 38c7 9 21 10 29 0 3-4 3-10-1-13-4-3-9-1-12 2l-2 2-2-2c-4-4-9-5-13-1-4 4-3 9 1 12Z"
          fill="#E7B08B"
        />
        <path
          d="M18 43c7-13 17-21 30-24-2 10-8 21-20 30l-4-4-6-2Z"
          fill="#0F8B8D"
        />
        <path d="M25 43c4-6 9-10 16-14" stroke="#F6C453" strokeWidth="5" strokeLinecap="round" />
        <path d="M29 31h5v5h-5z" fill="#D64161" />
        <path d="M37 25h5v5h-5z" fill="#315C9B" />
        <path d="M21 39h5v5h-5z" fill="#F26430" />
      </svg>
      <div>
        <div className="text-lg font-semibold tracking-tight text-slate-950">Walktogether</div>
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-teal-700">ABA</div>
      </div>
    </div>
  );
}
