import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLead } from "@/lib/crm";
import { LeadForm, type LeadFormValues } from "@/components/LeadForm";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/leads/new")({
  head: () => ({
    meta: [
      { title: "Add lead | LeadPilot AI" },
      { name: "description", content: "Capture a new lead with source, interest and follow-up." },
      { property: "og:title", content: "Add lead | LeadPilot AI" },
      {
        property: "og:description",
        content: "Capture a new lead with source, interest and follow-up.",
      },
    ],
  }),
  component: NewLead,
});

function NewLead() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: LeadFormValues) =>
      createLead({
        ...values,
        company: values.company || null,
        phone: values.phone || null,
        email: values.email || null,
        interest: values.interest || null,
        notes: values.notes || null,
        follow_up_date: values.follow_up_date || null,
      }),
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead added");
      navigate({ to: "/leads/$leadId", params: { leadId: lead.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Add lead</h1>
      <Card>
        <CardContent className="p-5">
          <LeadForm
            submitLabel="Save lead"
            pending={mutation.isPending}
            onSubmit={(values) => mutation.mutate(values)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
