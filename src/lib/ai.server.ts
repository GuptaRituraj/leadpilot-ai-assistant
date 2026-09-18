const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

type JsonSchema = Record<string, unknown>;

/**
 * Calls the Lovable AI Gateway Responses API with streaming (required for
 * reasoning models) and accumulates the final text server-side.
 */
async function callGateway(body: Record<string, unknown>): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      reasoning: { effort: "low" },
      store: false,
      ...body,
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted. Please add credits to continue.");
    throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        } else if (event.type === "response.completed" && event.response?.output_text) {
          if (!text) text = event.response.output_text;
        }
      } catch {
        // ignore malformed keepalive chunks
      }
    }
  }

  return text.trim();
}

export async function generateJson<T>(
  instructions: string,
  input: string,
  schemaName: string,
  schema: JsonSchema,
): Promise<T> {
  const text = await callGateway({
    instructions,
    input,
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema,
      },
    },
  });
  if (!text) throw new Error("The AI did not return a result. Please try again.");
  return JSON.parse(text) as T;
}

export async function generateText(instructions: string, input: string): Promise<string> {
  const text = await callGateway({ instructions, input });
  if (!text) throw new Error("The AI did not return a result. Please try again.");
  return text;
}

export function objectSchema(props: Record<string, JsonSchema>): JsonSchema {
  return {
    type: "object",
    additionalProperties: false,
    required: Object.keys(props),
    properties: props,
  };
}
