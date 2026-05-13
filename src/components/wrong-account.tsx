"use client";

import { useClerk } from "@clerk/nextjs";

export function WrongAccountPage({ email }: { email: string }) {
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf7]">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <span className="text-xl">⚠</span>
        </div>
        <h1 className="text-xl font-semibold text-slate-950">Wrong account</h1>
        <p className="mt-3 text-slate-600">
          You&apos;re signed in as <strong className="text-slate-900">{email}</strong>.
        </p>
        <p className="mt-1 text-slate-600">
          Only the admin account can access this dashboard. Please sign out and sign in with the correct account.
        </p>
        <button
          onClick={() => signOut({ redirectUrl: "/dashboard" })}
          className="mt-6 min-h-11 w-full rounded-md bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
        >
          Sign out and use a different account
        </button>
      </div>
    </div>
  );
}
