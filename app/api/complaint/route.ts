import { getClient, MODEL } from "@/lib/gemini";
import { buildComplaintSystemPrompt } from "@/lib/systemPrompt";
import { searchKnowledge, formatESContext } from "@/lib/elastic";
import { complaintSchema } from "@/lib/schemas";
import type { ComplaintDraft, Lang } from "@/lib/types";


export const runtime = "nodejs";

interface Body {
  issue: string;
  name?: string;
  employer?: string;
  details?: string;
  lang: Lang;
}

export async function POST(request: Request) {
  const client = getClient();
  if (!client) {
    return Response.json({ error: "no_key" }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const lang: Lang = body.lang === "hi" ? "hi" : "en";

  const facts = [
    `Problem type: ${body.issue || "labour dispute"}`,
    body.name ? `Worker name: ${body.name}` : "Worker name: [Your full name]",
    body.employer
      ? `Employer / contractor: ${body.employer}`
      : "Employer / contractor: [Employer name]",
    body.details ? `What happened (worker's words): ${body.details}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // ── Elasticsearch RAG ─────────────────────────────────────────────────────
  // Search for documents relevant to the issue type for richer complaint context.
  const esQuery = [body.issue, body.details].filter(Boolean).join(" ");
  const esDocs = await searchKnowledge(esQuery, lang, 4);
  const esContext = formatESContext(esDocs);

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: `Draft a formal labour complaint based on these details:\n\n${facts}`,
      config: {
        systemInstruction: buildComplaintSystemPrompt(lang, esContext || undefined),
        responseMimeType: "application/json",
        responseSchema: complaintSchema,
        temperature: 0.4,
      },
    });


    const text = response.text;
    if (!text) return Response.json({ error: "empty" }, { status: 502 });

    const draft = JSON.parse(text) as ComplaintDraft;
    return Response.json({ draft });
  } catch (err) {
    console.error("[/api/complaint] generation failed:", err);
    return Response.json({ error: "generic" }, { status: 500 });
  }
}
