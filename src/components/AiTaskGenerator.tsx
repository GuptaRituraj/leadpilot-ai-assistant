import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowRight, Check, CircleCheck, Loader2, MessageSquareText, Plus, Sparkles, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateDailyTasks, generateFollowUpMessage } from "@/lib/ai.functions";
import { PriorityBadge } from "@/components/LeadBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

async function fetchOpenTasks() {
  const { data, error } = await supabase
    .from("ai_tasks")
    .select("*, leads(name, company)")
    .eq("status", "Open")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function AiTaskGenerator({ leadCount }: { leadCount: number }) {
  const qc = useQueryClient();
  const generate = useServerFn(generateDailyTasks);
  const genMessage = useServerFn(generateFollowUpMessage);
  const [message, setMessage] = useState<{ lead: string; text: string; leadId: string } | null>(null);
  const tasks = useQuery({ queryKey: ["ai_tasks", "open"], queryFn: fetchOpenTasks });

  const run = useMutation({
    mutationFn: () => generate(),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["ai_tasks"] });
      if (r.created + r.updated === 0) toast.info("No leads currently need an AI-recommended action.");
      else toast.success(`${r.created} new, ${r.updated} refreshed task(s)`);
    },
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Done" | "Dismissed" }) => {
      const { error } = await supabase.from("ai_tasks").update({ status }).eq("id", id);
      if (error) throw error;
      return status;
    },
    onMutate: async ({ id }) => {
      qc.setQueryData(["ai_tasks", "open"], (old: Awaited<ReturnType<typeof fetchOpenTasks>> | undefined) => old?.filter((t) => t.id !== id));
    },
    onSuccess: (s) => { toast.success(s === "Done" ? "Task marked done" : "Task dismissed"); qc.invalidateQueries({ queryKey: ["ai_tasks"] }); },
    onError: () => { toast.error("Could not update the task"); qc.invalidateQueries({ queryKey: ["ai_tasks"] }); },
  });
  const msg = useMutation({
    mutationFn: ({ leadId }: { leadId: string; lead: string }) => genMessage({ data: { leadId, messageType: "Short Follow-up", tone: "Friendly" } }),
    onSuccess: (saved, v) => { setMessage({ lead: v.lead, text: saved.generated_message ?? "", leadId: v.leadId }); qc.invalidateQueries({ queryKey: ["messages", v.leadId] }); },
    onError: () => toast.error("Could not generate the message. Please try again."),
  });

  const list = tasks.data ?? [];
  return <Card className="shadow-none">
    <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b border-border p-5">
      <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary"><Sparkles className="size-4" /></span><div><CardTitle className="text-base">AI Task Generator</CardTitle><p className="mt-1 text-xs text-muted-foreground">Grounded next actions from your saved leads</p></div></div>
      <Button onClick={() => run.mutate()} disabled={run.isPending || leadCount === 0}>{run.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate Today's Sales Tasks</Button>
    </CardHeader>
    <CardContent className="p-5">
      {leadCount === 0 ? <div className="flex flex-col items-center gap-3 py-10 text-center"><p className="text-sm text-muted-foreground">Add a lead before tasks can be generated.</p><Button asChild variant="outline"><Link to="/leads/new"><Plus /> Add lead</Link></Button></div>
      : run.isPending ? <div className="space-y-3"><p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin text-primary" /> Analyzing your leads…</p><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      : run.isError ? <div className="flex flex-col items-center gap-3 py-8 text-center"><AlertTriangle className="size-7 text-destructive" /><p className="text-sm">Task generation failed. {(run.error as Error)?.message}</p><Button variant="outline" onClick={() => run.mutate()}>Retry</Button></div>
      : tasks.isLoading ? <Skeleton className="h-28" />
      : tasks.isError ? <div className="flex flex-col items-center gap-3 py-8"><p className="text-sm">Could not load saved tasks.</p><Button variant="outline" onClick={() => tasks.refetch()}>Retry</Button></div>
      : list.length === 0 ? <div className="flex flex-col items-center gap-2 py-10 text-center"><CircleCheck className="size-7 text-primary" /><p className="text-sm font-medium">No open tasks</p><p className="max-w-sm text-xs text-muted-foreground">{run.isSuccess ? "No leads currently require an AI-recommended action." : "Click Generate to analyze your saved leads."}</p></div>
      : <div className="grid gap-3 lg:grid-cols-2">{list.map((t) => {
          const leadName = t.leads?.name ?? "Lead";
          return <div key={t.id} className="flex flex-col gap-3 rounded-md border border-border bg-secondary/20 p-4 transition-colors hover:border-primary/40">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-xs font-medium text-primary">{leadName}{t.leads?.company ? ` · ${t.leads.company}` : ""}</p><p className="mt-1 font-semibold">{t.task_title}</p></div><PriorityBadge priority={t.priority ?? "Medium"} /></div>
            <div className="space-y-2 text-sm"><p><span className="text-xs font-medium uppercase text-muted-foreground">Why: </span>{t.task_reason}</p><p><span className="text-xs font-medium uppercase text-muted-foreground">Action: </span>{t.recommended_action}</p></div>
            <p className="text-xs text-muted-foreground">Due {t.due_date ?? "not set"} · {t.status}</p>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setStatus.mutate({ id: t.id, status: "Done" })}><Check /> Mark Done</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: t.id, status: "Dismissed" })}><X /> Dismiss</Button>
              <Button size="sm" variant="outline" disabled={msg.isPending} onClick={() => msg.mutate({ leadId: t.lead_id, lead: leadName })}>{msg.isPending && msg.variables?.leadId === t.lead_id ? <Loader2 className="animate-spin" /> : <MessageSquareText />} Follow-up Message</Button>
              <Button size="sm" variant="ghost" asChild><Link to="/leads/$leadId" params={{ leadId: t.lead_id }}>Open Lead <ArrowRight /></Link></Button>
            </div>
          </div>;
        })}</div>}
    </CardContent>
    <Dialog open={!!message} onOpenChange={(o) => !o && setMessage(null)}>
      <DialogContent><DialogHeader><DialogTitle>Follow-up for {message?.lead}</DialogTitle><DialogDescription>Saved to this lead's messages. Not sent anywhere.</DialogDescription></DialogHeader>
        <p className="whitespace-pre-wrap rounded-md border border-border bg-secondary/30 p-4 text-sm">{message?.text}</p>
        <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => { navigator.clipboard.writeText(message?.text ?? ""); toast.success("Message copied"); }}><Copy /> Copy</Button>{message && <Button asChild><Link to="/leads/$leadId" params={{ leadId: message.leadId }}>Open Lead</Link></Button>}</div>
      </DialogContent>
    </Dialog>
  </Card>;
}
