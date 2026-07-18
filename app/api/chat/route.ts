import { getClient, MODEL, GROUNDING_ENABLED, toContents } from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { searchKnowledge, formatESContext } from "@/lib/elastic";
import type { GenerateContentConfig } from "@google/genai";
import type { Lang, Source, WireMessage } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  messages: WireMessage[];
  lang: Lang;
}

function line(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(request: Request) {
  const client = getClient();
  if (!client) return Response.json({ error: "no_key" }, { status: 503 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const lang: Lang = body.lang === "hi" ? "hi" : "en";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const contents = toContents(messages);

  // ── Elasticsearch RAG ─────────────────────────────────────────────────────
  // Extract the last user message text and search ES for relevant documents.
  // Results are injected into the system prompt as high-priority context.
  // Falls back to empty string (no-op) if ES is not configured or fails.
  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.text ?? "";
  const esDocs = await searchKnowledge(lastUserText, lang);
  const esContext = formatESContext(esDocs);

  const systemInstruction = buildSystemPrompt(lang, esContext || undefined);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const seen = new Map<string, Source>();
      let searchSuggestionsHtml: string | undefined;
      let produced = false;

      const run = async (useTools: boolean) => {
        const config: GenerateContentConfig = { systemInstruction, temperature: 0.5 };
        if (useTools) config.tools = [{ googleSearch: {} }];

        const result = await client.models.generateContentStream({
          model: MODEL,
          contents,
          config,
        });

        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(line({ t: "text", v: text }));
            produced = true;
          }
          const gm = chunk.candidates?.[0]?.groundingMetadata;
          if (gm?.groundingChunks) {
            for (const g of gm.groundingChunks) {
              const web = g.web;
              if (web?.uri && !seen.has(web.uri)) {
                seen.set(web.uri, {
                  uri: web.uri,
                  title: web.title || web.domain || web.uri,
                  domain: web.domain,
                });
              }
            }
          }
          if (gm?.searchEntryPoint?.renderedContent) {
            searchSuggestionsHtml = gm.searchEntryPoint.renderedContent;
          }
        }
      };

      try {
        try {
          await run(GROUNDING_ENABLED);
        } catch (err) {
          // Grounding unavailable on this key (e.g. 429). Fall back to the
          // curated knowledge core with no web tool, if nothing streamed yet.
          if (produced || !GROUNDING_ENABLED) throw err;
          console.warn("[/api/chat] grounding failed, falling back:", (err as Error).message);
          await run(false);
        }

        controller.enqueue(
          line({
            t: "meta",
            sources: Array.from(seen.values()),
            searchSuggestionsHtml,
          })
        );
      } catch (err) {
        console.error("[/api/chat] generation failed:", err);
        controller.enqueue(line({ t: produced ? "meta" : "error", v: "generic" }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
