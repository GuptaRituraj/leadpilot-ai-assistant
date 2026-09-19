# LeadPilot AI frontend refresh

## Goal
Turn the existing working CRM into a polished dark workspace for solo founders, while keeping the current Lovable Cloud tables, relationships, CRUD operations, AI persistence, and no-login demo model unchanged.

## What will change
- Replace the top navigation with a desktop sidebar and compact mobile navigation, with Dashboard, Pipeline, Add Lead, and Ask CRM destinations.
- Redesign the Dashboard around a clear “What should I do today?” queue, totals, high-priority leads, status distribution, recent leads, and the requested quick actions.
- Convert the Leads page into a pipeline/search workspace with status columns, text search, status/source/priority/follow-up filters, overdue and high-priority emphasis, and practical sorting.
- Polish Add Lead and Lead Detail with consistent dark cards, stronger hierarchy, clear success/error/loading/empty states, and responsive controls.
- Preserve and visually improve the activity history, saved AI summaries, saved AI tasks, saved follow-up messages, editing, and confirmed deletion.
- Keep Ask CRM text-first with a clearly disabled/coming-soon microphone affordance.

## Data and behavior
- Continue using the existing six tables through the current live queries; no schema or seed changes.
- Keep lead create/read/update/delete and `lead_id`-based activity/AI reads and writes intact.
- Invalidate cached lead data after writes so Dashboard and Pipeline update immediately.
- Add explicit query error states and retry actions where current pages only show loading or empty content.
- Make “Generate AI Tasks” useful by taking the user to the highest-priority actionable lead, where the existing task generator is available; if no leads exist, it will direct to Add Lead.

## Technical details
- Update semantic color, surface, sidebar, status, and shadow tokens in the global stylesheet; dark mode will be applied by default at the document root.
- Reuse the existing shadcn Button, Card, Input, Select, Sheet, Skeleton, Alert Dialog, and Tooltip patterns rather than introducing another UI system.
- Keep existing TanStack routes and live query functions. URL-backed filters will be used on the Pipeline page so filtered views are shareable and survive navigation.
- Add route-level `og:type` and `twitter:card` metadata where missing.
- Verify database connectivity without modifying schema, then validate desktop and mobile layouts plus the lead CRUD flow against the live preview.

## Assumptions
- “Lead Pipeline / Search” remains at `/leads`; no additional database-backed task page is needed.
- Existing AI generation remains available from Lead Detail, and the dashboard quick action navigates to the best lead rather than bulk-generating tasks.
