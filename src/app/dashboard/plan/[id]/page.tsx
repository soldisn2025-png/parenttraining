export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { videos } from "@/data/catalog";
import { listContacts, getPlan } from "@/server/store";
import { PlanEditor } from "./plan-editor";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [plan, contacts] = await Promise.all([getPlan(id), listContacts()]).catch(() => [null, []] as const);
  if (!plan) notFound();
  return <PlanEditor initialPlan={plan} videos={videos} contacts={contacts} />;
}
