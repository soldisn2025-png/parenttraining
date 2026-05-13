export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { videos } from "@/data/catalog";
import { listContacts, getPlan } from "@/server/store";
import { PlanEditor } from "./plan-editor";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlan(id).catch((error) => {
    console.error("plan_detail_load_failed", {
      planId: id,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  });
  if (!plan) notFound();

  const contacts = await listContacts().catch((error) => {
    console.error("plan_contacts_load_failed", {
      planId: id,
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  });

  return <PlanEditor initialPlan={plan} videos={videos} contacts={contacts} />;
}
