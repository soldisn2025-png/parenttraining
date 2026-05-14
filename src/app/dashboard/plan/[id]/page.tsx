export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { notFound } from "next/navigation";
import { videos } from "@/data/catalog";
import { withTimeout } from "@/lib/async";
import { listContacts, getPlan } from "@/server/store";
import { PlanEditor } from "./plan-editor";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await withTimeout(getPlan(id), 20000, "Plan lookup").catch((error) => {
    console.error("plan_detail_load_failed", {
      planId: id,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  });
  if (!plan) notFound();

  const contacts = await withTimeout(listContacts(), 20000, "Contacts lookup").catch((error) => {
    console.error("plan_contacts_load_failed", {
      planId: id,
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  });

  return <PlanEditor initialPlan={plan} videos={videos} contacts={contacts} />;
}
