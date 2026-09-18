import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { fetchLeads, today, type Lead } from "@/lib/crm";
import { StatusBadge, PriorityBadge } from "@/components/LeadBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | LeadPilot AI" },
      {
        name: "description",
        content: "See total leads, overdue follow-ups and active opportunities at a glance.",
      },
      { property: "og:title", content: "Dashboard | LeadPilot AI" },
      {
        property: "og:description",
        content: "See total leads, overdue follow-ups and active opportunities at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <Link
      to="/leads/$leadId"
      params={{ leadId: lead.id }}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:bg-accent/40"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{lead.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {lead.company ?? "No company"} · {lead.interest ?? "No interest noted"}
        </p>
      </div>
      <StatusBadge status={lead.status} />
      <PriorityBadge priority={lead.priority} />
    </Link>
  );
}

function Dashboard() {
  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: fetchLeads });
  const day = today();

  const overdue = leads.filter(
    (l) => l.follow_up_date && l.follow_up_date < day && !["Won", "Lost"].includes(l.status),
  );
  const dueToday = leads.filter((l) => l.follow_up_date === day);
  const active = leads.filter((l) => ["Qualified", "Proposal Sent"].includes(l.status));
  const fresh = leads.filter((l) => l.status === "New");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your pipeline at a glance.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total leads" value={leads.length} icon={Users} />
        <Stat label="New leads" value={fresh.length} icon={Users} />
        <Stat label="Overdue follow-ups" value={overdue.length} icon={AlertTriangle} />
        <Stat label="Due today" value={dueToday.length} icon={CalendarClock} />
        <Stat label="Active opportunities" value={active.length} icon={TrendingUp} />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your leads…</p>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-8 text-center">
            <p className="text-sm text-muted-foreground">No leads yet.</p>
            <Link
              to="/leads/new"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Add your first lead
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Follow up today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dueToday.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing due today. Nice.</p>
              ) : (
                dueToday.map((l) => <LeadRow key={l.id} lead={l} />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Overdue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdue.length === 0 ? (
                <p className="text-sm text-muted-foreground">No overdue follow-ups.</p>
              ) : (
                overdue.map((l) => <LeadRow key={l.id} lead={l} />)
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
