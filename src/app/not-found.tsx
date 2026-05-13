import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-3 text-slate-600">This page is not available.</p>
        <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-teal-700 px-4 py-3 font-semibold text-white">
          Go home
        </Link>
      </div>
    </main>
  );
}
