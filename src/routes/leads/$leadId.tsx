import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Sparkles, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  ACTIVITY_TYPES,
  LEAD_STATUSES,
  MESSAGE_TYPES,
  PRIORITIES,
  addActivity,
  deleteLead,
  fetchActivities,
  fetchLead,
  fetchMessages,
  fetchSummaries,
  fetchTasks,
  today,
  updateLead,
  updateTaskStatus,
} from "@/lib/crm";
import {
  generateFollowUpMessage,
  generateLeadSummary,
  generateLeadTask,
} from "@/lib/ai.functions";
import { LeadForm, type LeadFormValues } from "@/components/LeadForm";
import { StatusBadge, PriorityBadge } from "@/components/LeadBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/leads/$leadId")({
  head: () => ({
    meta: [
      { title: "Lead detail | LeadPilot AI" },
      {
        name: "description",
        content: "Lead context, activity timeline, AI summary, tasks and follow-up messages.",
      },
      { property: "og:title", content: "Lead detail | LeadPilot AI" },
      {
        property: "og:description",
        content: "Lead context, activity timeline, AI summary, tasks and follow-up messages.",
      },
    ],
  }),
  component: LeadDetail,
});

const selectClass =
  "h-9 rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function LeadDetail() {
  const { leadId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const leadQuery = useQuery({ queryKey: ["lead", leadId], queryFn: () => fetchLead(leadId) });
  const activitiesQuery = useQuery({
    queryKey: ["activities", leadId],
    queryFn: () => fetchActivities(leadId),
  });
  const summariesQuery = useQuery({
    queryKey: ["summaries", leadId],
    queryFn: () => fetchSummaries(leadId),
  });
  const tasksQuery = useQuery({ queryKey: ["tasks", leadId], queryFn: () => fetchTasks(leadId) });
  const messagesQuery = useQuery({
    queryKey: ["messages", leadId],
    queryFn: () => fetchMessages(leadId),
  });

  const runSummary = useServerFn(generateLeadSummary);
  const runTask = useServerFn(generateLeadTask);
  const runMessage = useServerFn(generateFollowUpMessage);

  const invalidate = (key: string) => queryClient.invalidateQueries({ queryKey: [key, leadId] });

  const saveLead = useMutation({
    mutationFn: (values: Partial<LeadFormValues>) =>
      updateLead(leadId, {
        ...values,
        follow_up_date: values.follow_up_date ? values.follow_up_date : null,
      }),
    onSuccess: () => {
      invalidate("lead");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setEditing(false);
      toast.success("Lead updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeLead = useMutation({
    mutationFn: () => deleteLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted");
      navigate({ to: "/leads" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [activityType, setActivityType] = useState<string>("Call");
  const [activityNote, setActivityNote] = useState("");
  const [activityDate, setActivityDate] = useState(today());

  const logActivity = useMutation({
    mutationFn: () =>
      addActivity({
        lead_id: leadId,
        activity_type: activityType,
        activity_note: activityNote,
        activity_date: activityDate,
      }),
    onSuccess: () => {
      setActivityNote("");
      invalidate("activities");
      toast.success("Activity added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const summaryMutation = useMutation({
    mutationFn: () => runSummary({ data: { leadId } }),
    onSuccess: () => invalidate("summaries"),
    onError: (e: Error) => toast.error(e.message),
  });

  const taskMutation = useMutation({
    mutationFn: () => runTask({ data: { leadId } }),
    onSuccess: () => invalidate("tasks"),
    onError: (e: Error) => toast.error(e.message),
  });

  const [messageType, setMessageType] = useState<string>("WhatsApp");
  const [tone, setTone] = useState("Friendly");

  const messageMutation = useMutation({
    mutationFn: () =>
      runMessage({
        data: {
          leadId,
          messageType: messageType as (typeof MESSAGE_TYPES)[number],
          tone,
        },
      }),
    onSuccess: () => invalidate("messages"),
    onError: (e: Error) => toast.error(e.message),
  });

  const taskStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTaskStatus(id, status),
    onSuccess: () => invalidate("tasks"),
  });

  if (leadQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading lead…</p>;
  if (leadQuery.isError || !leadQuery.data)
    return <p className="text-sm text-muted-foreground">This lead could not be found.</p>;

  const lead = leadQuery.data;
  const summary = summariesQuery.data?.[0];

  return (
    <div className="space-y-5">
      <Link
        to="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All leads
      </Link>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
              <p className="text-sm text-muted-foreground">
                {lead.company ?? "No company"} · {lead.lead_source ?? "Unknown source"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[lead.phone, lead.email].filter(Boolean).join(" · ") || "No contact details"}
              </p>
              {lead.interest && <p className="mt-2 text-sm">Interested in: {lead.interest}</p>}
              {lead.notes && <p className="mt-1 text-sm text-muted-foreground">{lead.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
              <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
                {editing ? "Cancel" : "Edit"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm("Delete this lead and all its history?")) removeLead.mutate();
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>

          {editing ? (
            <LeadForm
              lead={lead}
              submitLabel="Save changes"
              pending={saveLead.isPending}
              onSubmit={(values) => saveLead.mutate(values)}
            />
          ) : (
            <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <select
                  className={selectClass}
                  value={lead.status}
                  onChange={(e) => saveLead.mutate({ status: e.target.value })}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <select
                  className={selectClass}
                  value={lead.priority}
                  onChange={(e) => saveLead.mutate({ priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Follow-up date</Label>
                <Input
                  type="date"
                  className="h-9 w-[170px]"
                  value={lead.follow_up_date ?? ""}
                  onChange={(e) => saveLead.mutate({ follow_up_date: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex gap-2">
                <select
                  className={selectClass}
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  className="h-9"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                />
              </div>
              <Textarea
                rows={2}
                placeholder="What happened?"
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
              />
              <Button
                size="sm"
                disabled={!activityNote.trim() || logActivity.isPending}
                onClick={() => logActivity.mutate()}
              >
                <Plus className="size-4" /> Add activity
              </Button>
            </div>

            {activitiesQuery.data?.length ? (
              <ol className="space-y-3 border-l border-border pl-4">
                {activitiesQuery.data.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                    <p className="text-sm font-medium">
                      {a.activity_type} · {a.activity_date}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.activity_note}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">AI summary</CardTitle>
              <Button
                size="sm"
                variant="outline"
                disabled={summaryMutation.isPending}
                onClick={() => summaryMutation.mutate()}
              >
                <Sparkles className="size-4" />
                {summaryMutation.isPending ? "Generating…" : "Generate"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {summary ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Summary</p>
                    <p>{summary.lead_summary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Current status</p>
                    <p>{summary.current_status_summary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Risk / opportunity</p>
                    <p>{summary.risk_or_opportunity}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Suggested next step</p>
                    <p>{summary.suggested_next_step}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No summary yet. Generate one from this lead's details and activity.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">AI tasks</CardTitle>
              <Button
                size="sm"
                variant="outline"
                disabled={taskMutation.isPending}
                onClick={() => taskMutation.mutate()}
              >
                <Sparkles className="size-4" />
                {taskMutation.isPending ? "Generating…" : "Suggest task"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksQuery.data?.length ? (
                tasksQuery.data.map((t) => (
                  <div key={t.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="flex-1 font-medium">{t.task_title}</p>
                      <PriorityBadge priority={t.priority ?? "Medium"} />
                      <select
                        className={selectClass}
                        value={t.status}
                        onChange={(e) =>
                          taskStatus.mutate({ id: t.id, status: e.target.value })
                        }
                      >
                        <option>Open</option>
                        <option>Done</option>
                        <option>Dismissed</option>
                      </select>
                    </div>
                    <p className="mt-1 text-muted-foreground">{t.task_reason}</p>
                    <p className="mt-1">{t.recommended_action}</p>
                    {t.due_date && (
                      <p className="mt-1 text-xs text-muted-foreground">Due {t.due_date}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI follow-up messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className={selectClass}
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                >
                  {MESSAGE_TYPES.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {["Friendly", "Professional", "Direct", "Warm"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={messageMutation.isPending}
                  onClick={() => messageMutation.mutate()}
                >
                  <Sparkles className="size-4" />
                  {messageMutation.isPending ? "Writing…" : "Generate"}
                </Button>
              </div>

              {messagesQuery.data?.length ? (
                messagesQuery.data.map((m) => (
                  <div key={m.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="text-xs text-muted-foreground">
                      {m.message_type} · {m.tone}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{m.generated_message}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(m.generated_message ?? "");
                        toast.success("Message copied");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No messages generated yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
