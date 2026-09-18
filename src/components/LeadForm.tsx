import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES, type Lead } from "@/lib/crm";

export type LeadFormValues = {
  name: string;
  company: string;
  phone: string;
  email: string;
  lead_source: string;
  interest: string;
  status: string;
  follow_up_date: string;
  priority: string;
  notes: string;
};

const selectClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LeadForm({
  lead,
  submitLabel,
  pending,
  onSubmit,
}: {
  lead?: Lead;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: LeadFormValues) => void;
}) {
  const [values, setValues] = useState<LeadFormValues>({
    name: lead?.name ?? "",
    company: lead?.company ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    lead_source: lead?.lead_source ?? "Other",
    interest: lead?.interest ?? "",
    status: lead?.status ?? "New",
    follow_up_date: lead?.follow_up_date ?? "",
    priority: lead?.priority ?? "Medium",
    notes: lead?.notes ?? "",
  });

  const set = (key: keyof LeadFormValues) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            required
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={values.company}
            onChange={(e) => set("company")(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={values.phone} onChange={(e) => set("phone")(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source">Source</Label>
          <select
            id="source"
            className={selectClass}
            value={values.lead_source}
            onChange={(e) => set("lead_source")(e.target.value)}
          >
            {LEAD_SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="interest">Interest</Label>
          <Input
            id="interest"
            value={values.interest}
            onChange={(e) => set("interest")(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className={selectClass}
            value={values.status}
            onChange={(e) => set("status")(e.target.value)}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            className={selectClass}
            value={values.priority}
            onChange={(e) => set("priority")(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="follow_up">Follow-up date</Label>
          <Input
            id="follow_up"
            type="date"
            value={values.follow_up_date}
            onChange={(e) => set("follow_up_date")(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={4}
          value={values.notes}
          onChange={(e) => set("notes")(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
