import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mic, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { askCrm } from "@/lib/ai.functions";
import { fetchVoiceLogs } from "@/lib/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask CRM | LeadPilot AI" },
      {
        name: "description",
        content: "Ask your CRM who to follow up with, what is overdue and what changed.",
      },
      { property: "og:title", content: "Ask CRM | LeadPilot AI" },
      {
        property: "og:description",
        content: "Ask your CRM who to follow up with, what is overdue and what changed.",
      },
    ],
  }),
  component: AskPage,
});

const suggestions = [
  "Who should I follow up with today?",
  "Which leads are overdue?",
  "Show my qualified leads",
  "What is happening with Rahul?",
];

function AskPage() {
  const [question, setQuestion] = useState("");
  const queryClient = useQueryClient();
  const ask = useServerFn(askCrm);

  const { data: logs = [] } = useQuery({ queryKey: ["voice-logs"], queryFn: fetchVoiceLogs });

  const mutation = useMutation({
    mutationFn: (q: string) => ask({ data: { question: q } }),
    onSuccess: () => {
      setQuestion("");
      queryClient.invalidateQueries({ queryKey: ["voice-logs"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submit = (q: string) => {
    if (q.trim().length < 2 || mutation.isPending) return;
    mutation.mutate(q.trim());
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ask CRM</h1>
        <p className="text-sm text-muted-foreground">
          Ask anything about your pipeline. Voice is coming soon.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(question);
            }}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Voice input coming soon"
              onClick={() => toast("Voice input is coming soon — type your question for now.")}
            >
              <Mic className="size-4" />
            </Button>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Who should I follow up with today?"
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Thinking…" : <SendHorizonal className="size-4" />}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No questions yet. Try one of the suggestions above.
        </p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{log.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{log.answer}</p>
                <p className="text-xs text-muted-foreground/70">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
