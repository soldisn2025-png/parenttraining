# Step 1: UX/UI Design Review

## Goal

Review the current Walktogether app UI using `docs/DESIGN_REVIEW_TEMPLATE.md` and produce a focused, actionable design QA report.

This is a product-design review step, not a broad refactor step. Do not modify app code in this step unless a tiny documentation correction is needed to complete the report.

## Screens to Review

Review the most important MVP flows:

- `/dashboard`
- `/dashboard/generate`
- `/dashboard/catalog`
- `/dashboard/contacts`
- `/dashboard/progress`
- `/dashboard/plan/[id]` if a local or seeded plan is available
- `/assignment/[token]` if a local or seeded assignment token is available

If a screen cannot be reached because auth, database, or seed data is unavailable, record that as a limitation rather than inventing feedback.

## Review Lens

Use `docs/DESIGN_REVIEW_TEMPLATE.md` as the source of truth. Focus on:

- Parent comprehension at a 5th-grade reading level
- Admin next-action clarity
- CTA hierarchy
- Trust and calmness
- Mobile tap targets and no horizontal overflow
- Status clarity: draft, revised, approved, sent
- Avoiding clinical language on parent-facing pages
- Avoiding hidden or surprising state changes

## Output

Create or update:

- `docs/DESIGN_REVIEW_FINDINGS.md`

Use this structure:

```md
# Design Review Findings

## Review Context
- Date:
- Reviewer:
- Screens reviewed:
- Screens not reviewed:

## One-Line Diagnosis

## What Is Working

## P0 Issues

## P1 Issues

## P2 Issues

## Recommended Next UI Pass

## Notes and Limits
```

Keep the findings concise and practical. Do not manufacture issues to fill sections. If there are no P0 issues, say so clearly.

## Acceptance Criteria

- `docs/DESIGN_REVIEW_FINDINGS.md` exists.
- The report explicitly references `docs/DESIGN_REVIEW_TEMPLATE.md`.
- The report includes at least `Review Context`, `One-Line Diagnosis`, `What Is Working`, and prioritized findings.
- Findings are based only on screens or files actually reviewed.
- No application code is changed unless explicitly required and documented.
- Update `phases/design-review/index.json` step 1 to `completed` with a one-line summary.
