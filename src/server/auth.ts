import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { normalizeEmail } from "@/lib/security";

export class UnauthorizedError extends Error {
  status = 401;
}

export class ForbiddenError extends Error {
  status = 403;
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new ForbiddenError("Admin email is not configured");
  }

  const emails = user.emailAddresses.map((email) => normalizeEmail(email.emailAddress));
  if (!emails.includes(normalizeEmail(adminEmail))) {
    throw new ForbiddenError("Admin access required");
  }

  return user;
}

export function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}
