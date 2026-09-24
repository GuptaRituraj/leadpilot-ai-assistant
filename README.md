# LeadPilot AI Assistant

Build a SaaS MVP called "LeadPilot AI" using Lovable Cloud backend/database. This is a lightweight AI CRM for solo founders and small business owners. Core promise: capture leads, track follow-ups, understand lead context, generate AI tasks, and provide a voice-ready CRM assistant.

IMPORTANT: Keep this workshop/demo-ready and simple. No login required for now; the app must work immediately without authentication. Do not add payments, team roles, full WhatsApp sending, calling automation, or other unnecessary integrations.

BACKEND/DATABASE:
Enable Lovable Cloud database (PostgreSQL/Supabase-backed) and create exactly these six application tables, with sensible UUID primary keys and timestamps/defaults:
1) leads: id UUID PK, name text NOT NULL, company text, phone text, email text, lead_source text with allowed values WhatsApp, LinkedIn, Referral, Website, Call, Email, Other, interest text, status text with allowed values New, Contacted, Qualified, Proposal Sent, Won, Lost, follow_up_date date, priority text with allowed values Low, Medium, High, notes text, created_at timestamp, updated_at timestamp.
2) lead_activities: id UUID PK, lead_id UUID FK -> leads.id with cascade delete, activity_type text, activity_note text, activity_date date, created_at timestamp.
3) ai_summaries: id UUID PK, lead_id UUID FK -> leads.id with cascade delete, lead_summary text, current_status_summary text, risk_or_opportunity text, suggested_next_step text, created_at timestamp, updated_at timestamp.
4) ai_tasks: id UUID PK, lead_id UUID FK -> leads.id with cascade delete, task_title text, task_reason text, recommended_action text, priority text, due_date date, status text with allowed values Open, Done, Dismissed, created_at timestamp, updated_at timestamp.
5) ai_messages: id UUID PK, lead_id UUID FK -> leads.id with cascade delete, message_type text with allowed values WhatsApp, Email, Short Follow-up, Professional Follow-up, generated_message text, tone text, created_at timestamp, updated_at timestamp.
6) voice_agent_logs: id UUID PK, question text, answer text, related_lead_ids JSONB (or text if necessary), created_at timestamp.

Add useful indexes on leads(status), leads(follow_up_date), leads(lead_source), leads(priority), and foreign keys. Since this is a no-login workshop demo, do not block CRUD behind auth/RLS; use a simple demo-safe data model. Preserve data across refreshes.

FRONTEND/UX:
Create a clean, lightweight CRM UI with:
- Dashboard as home
- Leads list with search/filter
- Add/Edit Lead form
- Lead Detail page
- Activity timeline
- AI summary section
- AI task section
- AI follow-up message section
- Ask CRM text interface designed with a microphone/voice-ready affordance, but do not require actual voice integration now
- Simple navigation and responsive layout.

Core flows must work:
- Create, read, update, delete leads.
- View a lead and its activities, AI summaries, tasks, and messages.
- Add activity to a lead.
- Set/update status, priority, and follow-up date.
- Dashboard shows total leads, new leads, overdue follow-ups, today's follow-ups, and active opportunities.
- Search and filter leads.
- AI outputs can be generated, saved to their corresponding tables, and displayed later.

AI:
Implement simple server-side AI actions/functions, using the available Lovable/OpenAI integration if supported, for:
1. AI Lead Summary: based on lead fields + recent activities, generate lead_summary, current_status_summary, risk_or_opportunity, suggested_next_step and save it in ai_summaries.
2. AI Task Generator: based on lead + activity/context, generate one practical next task with title, reason, recommended action, priority and due date, save it in ai_tasks.
3. AI follow-up message generator: generate a short useful message and save it in ai_messages.
4. Ask CRM: text-first assistant that can answer questions using CRM data, such as "Who should I follow up with today?", "Which leads are overdue?", "Show my qualified leads", or "What is happening with Rahul?". Save question/answer and related lead IDs in voice_agent_logs. Make the UI voice-ready with a microphone icon/button placeholder, but no actual voice API in v1.

Use sensible empty states and demo seed data only if helpful, but don't fabricate excessive complexity. Keep components simple and maintainable. Do not build payments, teams, full WhatsApp integration, calling automation, email sending, or advanced analytics.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d869935d-45f3-480c-b506-63f4373e7d5f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
