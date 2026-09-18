import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { fetchLeads, LEAD_STATUSES, PRIORITIES, LEAD_SOURCES } from "@/lib/crm";
import { StatusBadge, PriorityBadge } from "@/components/LeadBadges";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/leads/")({
  head: () => ({
    meta: [
      { title: "Leads | LeadPilot AI" },
      { name: "description", content: "Search, filter and manage every lead in your pipeline." },
      { property: "og:title", content: "Leads | LeadPilot AI" },
      {
        property: "og:description",
        content: "Search, filter and manage every lead in your pipeline.",
      },
    ],
  }),
  component: LeadsPage,
});

const selectClass =
  "h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function LeadsPage() {
  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: fetchLeads });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [source, setSource] = useState("");

  const term = search.trim().toLowerCase();
  const filtered = leads.filter((l) => {
    const haystack = [l.name, l.company, l.email, l.phone, l.interest, l.notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      (!term || haystack.includes(term)) &&
      (!status || l.status === status) &&
      (!priority || l.priority === priority) &&
      (!source || l.lead_source === source)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {leads.length} leads</p>
        </div>
        <Link
          to="/leads/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add lead
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, interest…"
            className="pl-9"
          />
        </div>
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className={selectClass}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select className={selectClass} value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No leads match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <Link
              key={lead.id}
              to="/leads/$leadId"
              params={{ leadId: lead.id }}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{lead.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {lead.company ?? "No company"} · {lead.lead_source ?? "Unknown source"}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {lead.follow_up_date ? `Follow up ${lead.follow_up_date}` : "No follow-up set"}
              </div>
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
