import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  New: "border-status-new/30 bg-status-new/10 text-status-new",
  Contacted: "border-status-contacted/30 bg-status-contacted/10 text-status-contacted",
  Qualified: "border-status-qualified/30 bg-status-qualified/10 text-status-qualified",
  "Proposal Sent": "border-status-proposal/30 bg-status-proposal/10 text-status-proposal",
  Won: "border-status-won/30 bg-status-won/10 text-status-won",
  Lost: "border-status-lost/30 bg-status-lost/10 text-status-lost",
};
const priorityStyles: Record<string, string> = {
  Low: "border-border bg-muted/50 text-muted-foreground",
  Medium: "border-status-contacted/30 bg-status-contacted/10 text-status-contacted",
  High: "border-destructive/30 bg-destructive/10 text-destructive",
};
function Pill({ label, className }: { label: string; className?: string }) {
  return <span className={cn("inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold", className)}>{label}</span>;
}
export function StatusBadge({ status }: { status: string }) {
  return <Pill label={status} className={statusStyles[status] ?? "border-border bg-muted text-muted-foreground"} />;
}
export function PriorityBadge({ priority }: { priority: string }) {
  return <Pill label={priority} className={priorityStyles[priority] ?? "border-border bg-muted text-muted-foreground"} />;
}
