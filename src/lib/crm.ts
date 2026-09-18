import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Lead = Tables<"leads">;
export type Activity = Tables<"lead_activities">;
export type AiSummary = Tables<"ai_summaries">;
export type AiTask = Tables<"ai_tasks">;
export type AiMessage = Tables<"ai_messages">;

export const LEAD_SOURCES = [
  "WhatsApp",
  "LinkedIn",
  "Referral",
  "Website",
  "Call",
  "Email",
  "Other",
] as const;

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
] as const;

export const PRIORITIES = ["Low", "Medium", "High"] as const;

export const ACTIVITY_TYPES = ["Call", "WhatsApp", "Email", "Meeting", "Note"] as const;

export const MESSAGE_TYPES = [
  "WhatsApp",
  "Email",
  "Short Follow-up",
  "Professional Follow-up",
] as const;

export const today = () => new Date().toISOString().slice(0, 10);

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchLead(id: string): Promise<Lead> {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createLead(values: TablesInsert<"leads">) {
  const { data, error } = await supabase.from("leads").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, values: TablesUpdate<"leads">) {
  const { data, error } = await supabase
    .from("leads")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchActivities(leadId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("activity_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addActivity(values: TablesInsert<"lead_activities">) {
  const { error } = await supabase.from("lead_activities").insert(values);
  if (error) throw error;
}

export async function fetchSummaries(leadId: string): Promise<AiSummary[]> {
  const { data, error } = await supabase
    .from("ai_summaries")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTasks(leadId: string): Promise<AiTask[]> {
  const { data, error } = await supabase
    .from("ai_tasks")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateTaskStatus(id: string, status: string) {
  const { error } = await supabase.from("ai_tasks").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function fetchMessages(leadId: string): Promise<AiMessage[]> {
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchVoiceLogs() {
  const { data, error } = await supabase
    .from("voice_agent_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}
