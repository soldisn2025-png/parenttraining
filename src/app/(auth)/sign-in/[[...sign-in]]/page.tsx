import { SignIn } from "@clerk/nextjs";
import { WalktogetherLogo } from "@/components/walktogether-logo";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#fbfaf7] px-4">
        <WalktogetherLogo />
        <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
          Clerk is not configured yet. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable sign-in.
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#fbfaf7] px-4">
      <WalktogetherLogo />
      <SignIn routing="path" path="/sign-in" />
    </main>
  );
}
