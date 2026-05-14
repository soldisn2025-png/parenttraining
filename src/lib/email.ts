interface AssignmentEmailInput {
  firstName: string;
  assignmentUrl: string;
  ttlDays: number;
}

export function getAssignmentEmailSubject() {
  return "Your practice plan for this week is ready";
}

export function buildAssignmentEmail({ firstName, assignmentUrl, ttlDays }: AssignmentEmailInput) {
  const safeFirstName = firstName.trim() || "there";
  const text = [
    `Hi ${safeFirstName},`,
    "",
    "I put together a short practice plan for you this week.",
    "Tap the link below to see your videos and one small thing to try with your child each day.",
    "",
    assignmentUrl,
    "",
    `It will be available for ${ttlDays} days. See you soon!`,
    "- Kelly",
    "",
    "Walktogether - Sent by Kelly",
    "To stop receiving these emails, reply and let Kelly know.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px;">
      <p>Hi ${escapeHtml(safeFirstName)},</p>
      <p>I put together a short practice plan for you this week. Tap the button below to see your videos and one small thing to try with your child each day.</p>
      <p>
        <a href="${escapeHtml(assignmentUrl)}" style="display: inline-block; background: #0f766e; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">
          See your plan
        </a>
      </p>
      <p>It will be available for ${ttlDays} days. See you soon!</p>
      <p>- Kelly</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 13px; color: #64748b;">Walktogether - Sent by Kelly<br />To stop receiving these emails, reply and let Kelly know.</p>
    </div>
  `;

  return { subject: getAssignmentEmailSubject(), text, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
