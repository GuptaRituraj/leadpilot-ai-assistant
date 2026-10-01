import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, AlertTriangle, UsersRound, TrendingUp, ArrowRight, Plus, Sparkles, CircleCheck, Clock3 } from "lucide-react";
import { fetchLeads, today, type Lead } from "@/lib/crm";
import { StatusBadge, PriorityBadge } from "@/components/LeadBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AiTaskGenerator } from "@/components/AiTaskGenerator";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard | LeadPilot AI" },
    { name: "description", content: "See total leads, overdue follow-ups and active opportunities at a glance." },
    { property: "og:title", content: "Dashboard | LeadPilot AI" },
    { property: "og:description", content: "See total leads, overdue follow-ups and active opportunities at a glance." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Dashboard,
});
function Stat({ label, value, icon: Icon, accent = false }: { label: string; value: number; icon: typeof UsersRound; accent?: boolean }) {
  return <Card className="group min-h-32 border-border bg-card shadow-none transition-colors hover:border-primary/40">
    <CardContent className="flex h-full flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{label}</p><Icon className={`size-4 ${accent ? "text-primary" : "text-muted-foreground"}`} /></div>
      <p className="mt-5 text-3xl font-semibold leading-none text-foreground tabular-nums">{value}</p>
    </CardContent>
  </Card>;
}
function LeadRow({ lead }: { lead: Lead }) {
  return <Link to="/leads/$leadId" params={{ leadId: lead.id }} className="flex flex-wrap items-center gap-3 border-b border-border py-3.5 transition-colors last:border-0 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-xs font-semibold text-primary">{lead.name.slice(0, 2).toUpperCase()}</span>
    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{lead.name}</p><p className="truncate text-xs text-muted-foreground">{lead.company || "Independent"} · {lead.interest || "No interest noted"}</p></div>
    <StatusBadge status={lead.status} /><PriorityBadge priority={lead.priority} /><ArrowRight className="size-4 text-muted-foreground" />
  </Link>;
}
function Dashboard() {
  const { data: leads = [], isLoading, isError, refetch } = useQuery({ queryKey: ["leads"], queryFn: fetchLeads });
  const day = today();
  const overdue = leads.filter((l) => l.follow_up_date && l.follow_up_date < day && !["Won", "Lost"].includes(l.status));
  const dueToday = leads.filter((l) => l.follow_up_date === day);
  const active = leads.filter((l) => ["Qualified", "Proposal Sent"].includes(l.status));
  const fresh = leads.filter((l) => l.status === "New");
  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase text-primary">Overview</p><h1 className="text-3xl font-semibold">Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Your pipeline, priorities, and next moves in one place.</p></div><Button asChild><Link to="/leads/new"><Plus /> Add new lead</Link></Button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Stat label="Total leads" value={leads.length} icon={UsersRound} accent /><Stat label="New leads" value={fresh.length} icon={Sparkles} /><Stat label="Overdue follow-ups" value={overdue.length} icon={AlertTriangle} /><Stat label="Due today" value={dueToday.length} icon={CalendarClock} /><Stat label="Active opportunities" value={active.length} icon={TrendingUp} />
    </div>
    {!isLoading && !isError && <AiTaskGenerator leadCount={leads.length} />}
    {isLoading ? <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div> : isError ? <Card><CardContent className="flex flex-col items-center gap-4 py-12 text-center"><AlertTriangle className="size-8 text-destructive" /><p>Could not load your leads.</p><Button variant="outline" onClick={() => refetch()}>Try again</Button></CardContent></Card> : leads.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-16 text-center"><UsersRound className="size-8 text-primary" /><h2 className="font-semibold">Your pipeline starts here</h2><p className="text-sm text-muted-foreground">Add a lead to start tracking conversations and follow-ups.</p><Button asChild><Link to="/leads/new"><Plus /> Add your first lead</Link></Button></div> : <>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="shadow-none"><CardHeader className="border-b border-border p-5"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary"><Clock3 className="size-4" /></span><div><CardTitle className="text-base">What should I do today?</CardTitle><p className="mt-1 text-xs text-muted-foreground">Follow-ups that need your attention</p></div></div></CardHeader><CardContent className="px-5 py-2">{[...dueToday, ...overdue].length ? [...dueToday, ...overdue].map((l) => <LeadRow key={l.id} lead={l} />) : <div className="flex flex-col items-center gap-2 py-12 text-center"><CircleCheck className="size-7 text-primary" /><p className="text-sm font-medium">All caught up</p><p className="text-xs text-muted-foreground">No follow-ups due today or overdue.</p></div>}</CardContent></Card>
        <Card className="shadow-none"><CardHeader className="border-b border-border p-5"><CardTitle className="text-base">Quick actions</CardTitle><p className="text-xs text-muted-foreground">Keep your momentum going</p></CardHeader><CardContent className="grid gap-2 p-4">{[{to:"/leads/new",icon:Plus,label:"Add new lead"},{to:"/leads",icon:UsersRound,label:"Open pipeline"},{to:"/ask",icon:Sparkles,label:"Ask CRM"}].map(({to,icon:Icon,label}) => <Button key={to} asChild variant="ghost" className="h-11 justify-start border border-border bg-secondary/30"><Link to={to}><Icon className="text-primary" />{label}<ArrowRight className="ml-auto text-muted-foreground" /></Link></Button>)}</CardContent></Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-2"><Card className="shadow-none"><CardHeader className="flex-row items-center justify-between border-b border-border p-5"><CardTitle className="text-base">High priority</CardTitle><span className="text-xs text-muted-foreground">{leads.filter(l => l.priority === "High").length} leads</span></CardHeader><CardContent className="px-5 py-2">{leads.filter(l => l.priority === "High").slice(0, 5).map(l => <LeadRow key={l.id} lead={l} />)}</CardContent></Card><Card className="shadow-none"><CardHeader className="flex-row items-center justify-between border-b border-border p-5"><CardTitle className="text-base">Recent leads</CardTitle><Button asChild variant="ghost" size="sm"><Link to="/leads">View all <ArrowRight /></Link></Button></CardHeader><CardContent className="px-5 py-2">{leads.slice(0,5).map(l => <LeadRow key={l.id} lead={l} />)}</CardContent></Card></div>
    </>}
  </div>;
}
