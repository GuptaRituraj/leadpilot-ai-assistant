import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createLead } from "@/lib/crm";
import { LeadForm, type LeadFormValues } from "@/components/LeadForm";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/leads/new")({ head: () => ({ meta: [
  { title: "Add lead | LeadPilot AI" }, { name: "description", content: "Capture a new lead with source, interest and follow-up." },
  { property: "og:title", content: "Add lead | LeadPilot AI" }, { property: "og:description", content: "Capture a new lead with source, interest and follow-up." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: NewLead });
function NewLead() {
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: (values: LeadFormValues) => createLead({ ...values, company: values.company || null, phone: values.phone || null, email: values.email || null, interest: values.interest || null, notes: values.notes || null, follow_up_date: values.follow_up_date || null }), onSuccess: lead => { queryClient.invalidateQueries({ queryKey: ["leads"] }); toast.success("Lead added"); navigate({ to: "/leads/$leadId", params: { leadId: lead.id } }); }, onError: (error: Error) => toast.error(error.message) });
  return <div className="mx-auto max-w-4xl space-y-7"><Link to="/leads" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"><ArrowLeft className="size-4" /> Back to pipeline</Link><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-md bg-primary/10 text-primary"><UserPlus className="size-6" /></span><div><h1 className="text-3xl font-semibold">Add new lead</h1><p className="mt-1 text-sm text-muted-foreground">Capture the details now. Keep the conversation moving.</p></div></div><Card className="shadow-none"><CardContent className="p-5 sm:p-8"><LeadForm submitLabel="Save lead" pending={mutation.isPending} onSubmit={values => mutation.mutate(values)} onCancel={() => navigate({to:"/leads"})} /></CardContent></Card></div>;
}
