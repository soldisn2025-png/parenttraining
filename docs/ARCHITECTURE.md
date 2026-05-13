# Architecture

## Data
Supabase Postgres schema is defined in `src/db/schema.ts`, with SQL migration files under `drizzle/migrations`.

All tables have RLS enabled with no public policies for MVP. The app validates Clerk admin access or assignment token access in server code before touching data.

## Privacy
Stored parent data is limited to first name and email. This is lightweight PII, not PHI. Contacts persist until manually deleted by the admin. Raw prompts are never stored; only SHA-256 prompt hashes are saved.

## Consent Gate
For MVP, planned video content features the owner's own child. If external children are ever featured, add consent-log workflow before any video can move to `published`.

## Scaling Notes
The current in-process store supports local MVP development. Production persistence should use the Drizzle schema against Supabase. Replace in-memory rate limiting with Upstash Redis before multi-instance production use.
