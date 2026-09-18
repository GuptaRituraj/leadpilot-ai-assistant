import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  New: "bg-chart-3/15 text-chart-3",
  Contacted: "bg-chart-2/20 text-chart-2",
  Qualified: "bg-primary/15 text-primary",
  "Proposal Sent": "bg-chart-5/15 text-chart-5",
  Won: "bg-chart-5/20 text-chart-5",
  Lost: "bg-destructive/12 text-destructive",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-chart-2/20 text-chart-2",
  High: "bg-destructive/12 text-destructive",
};

function Pill({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Pill label={status} className={statusStyles[status] ?? "bg-muted text-muted-foreground"} />;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Pill label={priority} className={priorityStyles[priority] ?? "bg-muted text-muted-foreground"} />
  );
}
