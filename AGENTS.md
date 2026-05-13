# Walktogether Development Rules

## Stack
- Next.js App Router with TypeScript strict mode
- Tailwind CSS for UI
- Clerk for admin authentication
- Supabase Postgres with Drizzle schema/migrations
- Resend for email and Anthropic for rationale text

## Architecture Rules
- CRITICAL: `ADMIN_EMAIL` must be read from environment variables, never hardcoded in authorization logic.
- CRITICAL: Do not store raw staff prompts, child names, diagnoses, DOB, or clinical notes.
- CRITICAL: All database access is server-side only. Do not expose service-role credentials or direct Supabase writes to client components.
- CRITICAL: AI may write rationale/guidance only. It must never select, reorder, or silently rewrite video selections.
- Parent-facing language must be simple, warm, and free of clinical jargon.

## Development Process
- Use TDD: write or update tests before completing feature work.
- Run `npm test`, `npm run lint`, and `npm run build` before handoff.
- Keep final video order capped at 5 in UI and server logic.
