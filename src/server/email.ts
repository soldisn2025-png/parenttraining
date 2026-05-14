import "server-only";

import { Resend } from "resend";
import { buildAssignmentEmail } from "@/lib/email";

interface SendAssignmentEmailInput {
  to: string;
  firstName: string;
  assignmentUrl: string;
}

export class EmailSendError extends Error {
  constructor(message = "Could not send the assignment email") {
    super(message);
    this.name = "EmailSendError";
  }
}

export async function sendAssignmentEmail(input: SendAssignmentEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EmailSendError("Email is not configured");
  }

  const ttlDays = Number(process.env.ASSIGNMENT_TOKEN_TTL_DAYS ?? "14");
  const email = buildAssignmentEmail({
    firstName: input.firstName,
    assignmentUrl: input.assignmentUrl,
    ttlDays: Number.isFinite(ttlDays) ? ttlDays : 14,
  });

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Kelly from Walktogether <kelly@walktogetheraba.com>",
    to: input.to,
    replyTo: process.env.ADMIN_EMAIL?.split(",").map((e) => e.trim()).filter(Boolean),
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (error) {
    console.error("Resend assignment email failed", {
      name: error.name,
      message: error.message,
    });
    throw new EmailSendError(`Could not send email: ${error.name} — ${error.message}`);
  }

  return data;
}
