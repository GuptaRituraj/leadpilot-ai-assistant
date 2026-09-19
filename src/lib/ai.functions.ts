import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LeadIdInput = z.object({ leadId: z.string().uuid() });

async function loadContext(leadId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: lead, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();
  if (error || !lead) throw new Error("Lead not found");
  const { data: activities } = await supabaseAdmin
    .from("lead_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("activity_date", { ascending: false })
    .limit(10);
  return { lead, activities: activities ?? [], supabaseAdmin };
}

function describe(lead: Record<string, unknown>, activities: Array<Record<string, unknown>>) {
  return [
    `Lead: ${lead["name"]}`,
    `Company: ${lead["company"] ?? "-"}`,
    `Source: ${lead["lead_source"] ?? "-"}`,
    `Interest: ${lead["interest"] ?? "-"}`,
    `Status: ${lead["status"]}`,
    `Priority: ${lead["priority"]}`,
    `Follow-up date: ${lead["follow_up_date"] ?? "none"}`,
    `Notes: ${lead["notes"] ?? "-"}`,
    `Registered at: ${lead["created_at"] ?? "unavailable"}`,
    `Last updated at: ${lead["updated_at"] ?? "unavailable"}`,
    `Today: ${new Date().toISOString().slice(0, 10)}`,
    "Recent activities:",
    activities.length
      ? activities
          .map((a) => `- ${a["activity_date"]} [${a["activity_type"]}] ${a["activity_note"]}`)
          .join("\n")
      : "- none recorded",
  ].join("\n");
}

export const generateLeadSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadIdInput.parse(input))
  .handler(async ({ data }) => {
    const { generateJson, objectSchema } = await import("./ai.server");
    const { lead, activities, supabaseAdmin } = await loadContext(data.leadId);

    const result = await generateJson<{
      lead_summary: string;
      current_status_summary: string;
      risk_or_opportunity: string;
      suggested_next_step: string;
    }>(
      "You are a concise sales CRM assistant for a solo founder. Ground every statement only in the supplied lead fields and activity history. Never invent facts, intent, budget, timing, objections, or contact history. When information is missing, say it is not available. Summarize what the lead is about and their main requirement in lead_summary; include the explicit status and priority in current_status_summary; identify a grounded risk or opportunity; and recommend one practical next step. Each field must be 1-2 short sentences.",
      describe(lead, activities),
      "lead_summary",
      objectSchema({
        lead_summary: { type: "string" },
        current_status_summary: { type: "string" },
        risk_or_opportunity: { type: "string" },
        suggested_next_step: { type: "string" },
      }),
    );

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("ai_summaries")
      .select("id")
      .eq("lead_id", data.leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    const summaryValues = {
      lead_id: data.leadId,
      lead_summary: result.lead_summary,
      current_status_summary: result.current_status_summary,
      risk_or_opportunity: result.risk_or_opportunity,
      suggested_next_step: result.suggested_next_step,
      updated_at: new Date().toISOString(),
    };

    const saveQuery = existing
      ? supabaseAdmin.from("ai_summaries").update(summaryValues).eq("id", existing.id)
      : supabaseAdmin.from("ai_summaries").insert(summaryValues);
    const { data: saved, error } = await saveQuery.select().single();
    if (error) throw new Error(error.message);
    return saved;
  });

export const generateLeadTask = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadIdInput.parse(input))
  .handler(async ({ data }) => {
    const { generateJson, objectSchema } = await import("./ai.server");
    const { lead, activities, supabaseAdmin } = await loadContext(data.leadId);

    const result = await generateJson<{
      task_title: string;
      task_reason: string;
      recommended_action: string;
      priority: string;
      due_date: string;
    }>(
      "You generate exactly one practical next sales task. priority must be Low, Medium or High. due_date must be an ISO date (YYYY-MM-DD) within the next 14 days.",
      describe(lead, activities),
      "lead_task",
      objectSchema({
        task_title: { type: "string" },
        task_reason: { type: "string" },
        recommended_action: { type: "string" },
        priority: { type: "string", enum: ["Low", "Medium", "High"] },
        due_date: { type: "string" },
      }),
    );

    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(result.due_date) ? result.due_date : null;
    const { data: saved, error } = await supabaseAdmin
      .from("ai_tasks")
      .insert({
        lead_id: data.leadId,
        task_title: result.task_title,
        task_reason: result.task_reason,
        recommended_action: result.recommended_action,
        priority: result.priority,
        due_date: dueDate,
        status: "Open",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return saved;
  });

export const generateFollowUpMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        leadId: z.string().uuid(),
        messageType: z.enum(["WhatsApp", "Email", "Short Follow-up", "Professional Follow-up"]),
        tone: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { generateText } = await import("./ai.server");
    const { lead, activities, supabaseAdmin } = await loadContext(data.leadId);

    const message = await generateText(
      `Write a ${data.messageType} follow-up message in a ${data.tone} tone. Keep it short (max 90 words), personal and ready to send. No placeholders other than the sender's name as [Your name]. Return only the message text.`,
      describe(lead, activities),
    );

    const { data: saved, error } = await supabaseAdmin
      .from("ai_messages")
      .insert({
        lead_id: data.leadId,
        message_type: data.messageType,
        tone: data.tone,
        generated_message: message,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return saved;
  });

export const askCrm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ question: z.string().min(2) }).parse(input))
  .handler(async ({ data }) => {
    const { generateJson, objectSchema } = await import("./ai.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: leads } = await supabaseAdmin
      .from("leads")
      .select("id, name, company, status, priority, follow_up_date, interest, lead_source, notes")
      .order("created_at", { ascending: false })
      .limit(200);

    const context = (leads ?? [])
      .map(
        (l) =>
          `${l.id} | ${l.name} | ${l.company ?? "-"} | ${l.status} | ${l.priority} | follow-up: ${l.follow_up_date ?? "none"} | ${l.interest ?? "-"} | via ${l.lead_source ?? "-"}`,
      )
      .join("\n");

    const result = await generateJson<{ answer: string; related_lead_ids: string[] }>(
      `You are a CRM assistant. Answer the founder's question using only the lead rows provided. Today is ${new Date().toISOString().slice(0, 10)}. Be brief and actionable, use short bullet lines. related_lead_ids must contain the ids of leads you referenced (empty array if none).`,
      `Question: ${data.question}\n\nLeads (id | name | company | status | priority | follow-up | interest | source):\n${context || "no leads yet"}`,
      "crm_answer",
      objectSchema({
        answer: { type: "string" },
        related_lead_ids: { type: "array", items: { type: "string" } },
      }),
    );

    const validIds = new Set((leads ?? []).map((l) => l.id));
    const relatedIds = (result.related_lead_ids ?? []).filter((id) => validIds.has(id));

    const { data: saved, error } = await supabaseAdmin
      .from("voice_agent_logs")
      .insert({
        question: data.question,
        answer: result.answer,
        related_lead_ids: relatedIds,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return saved;
  });
