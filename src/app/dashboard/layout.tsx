export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { DashboardNav } from "@/components/dashboard-nav";
import { WrongAccountPage } from "@/components/wrong-account";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/server/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof UnauthorizedError) {
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress ?? "unknown";
      return <WrongAccountPage email={email} />;
    }
    throw error;
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
