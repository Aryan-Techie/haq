/**
 * lib/elastic.ts
 *
 * Elasticsearch client + knowledge retrieval for the Haq RAG pipeline.
 *
 * When ELASTICSEARCH_URL is configured, every chat/complaint request first
 * searches the "haq-knowledge" index for documents relevant to the worker's
 * question and injects the top results into the Gemini system prompt.
 *
 * Graceful degradation: if ES is not configured or the search fails, the
 * app falls back to the hard-coded lib/knowledge.ts baseline — silently.
 *
 * Index: "haq-knowledge" (created + seeded by scripts/seed-elastic.mjs)
 */

import { Client } from "@elastic/elasticsearch";

// ─── Client (singleton) ──────────────────────────────────────────────────────

let _client: Client | null | undefined; // undefined = not yet initialised

export function getElasticClient(): Client | null {
  if (_client !== undefined) return _client;

  const url = process.env.ELASTICSEARCH_URL?.trim();
  if (!url) {
    _client = null;
    return null;
  }

  const apiKey = process.env.ELASTICSEARCH_API_KEY?.trim();
  const username = process.env.ELASTICSEARCH_USERNAME?.trim() || "elastic";
  const password = process.env.ELASTICSEARCH_PASSWORD?.trim() || "";

  _client = new Client({
    node: url,
    auth: apiKey
      ? { apiKey }
      : { username, password },
    tls: { rejectUnauthorized: false }, // allow self-signed certs in dev/Docker
  });

  console.log("[elastic] client initialised →", url);
  return _client;
}

export const ELASTIC_INDEX =
  process.env.ELASTICSEARCH_INDEX?.trim() || "haq-knowledge";

// ─── Document Schema ─────────────────────────────────────────────────────────

export type DocType =
  | "statute"
  | "wage"
  | "scheme"
  | "helpline"
  | "office"
  | "portal"
  | "faq";

export interface HaqDocument {
  id?: string;
  type: DocType;
  title: string;
  content: string;
  tags?: string[];
  source?: string;
  url?: string;
  /** "hi" | "en" | "both" — used for language-preference boosting */
  language?: "hi" | "en" | "both";
  /** ISO date string — for staleness awareness */
  updatedAt?: string;
}

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * Full-text (BM25) search over the knowledge index.
 * Returns an empty array on any error — caller falls back to knowledge.ts.
 */
export async function searchKnowledge(
  query: string,
  _lang: "hi" | "en",
  size = 6
): Promise<HaqDocument[]> {
  const client = getElasticClient();
  if (!client || !query.trim()) return [];

  try {
    const result = await client.search<HaqDocument>({
      index: ELASTIC_INDEX,
      body: {
        query: {
          multi_match: {
            query,
            fields: [
              "title^3",    // title matches are worth 3×
              "content^2",  // content 2×
              "tags",       // tag matches are 1×
            ],
            type: "best_fields",
            fuzziness: "AUTO",
          },
        },
        size,
        _source: true,
      },
    });

    const docs = result.hits.hits
      .map((h) => h._source)
      .filter((d): d is HaqDocument => !!d);

    console.log(`[elastic] query="${query.slice(0, 60)}" → ${docs.length} hits`);
    return docs;
  } catch (err) {
    console.warn("[elastic] search failed, using knowledge.ts fallback:", (err as Error).message);
    return [];
  }
}

// ─── Context Formatter ───────────────────────────────────────────────────────

/**
 * Converts Elasticsearch hits into a formatted text block that is injected
 * into the Gemini system prompt above the baseline knowledge.ts facts.
 */
export function formatESContext(docs: HaqDocument[]): string {
  if (!docs.length) return "";

  const lines = docs.map((d, i) => {
    const parts: string[] = [`[${i + 1}] ${d.type.toUpperCase()}: ${d.title}`];
    parts.push(d.content);
    if (d.source || d.url) {
      parts.push(`Source: ${d.source ?? ""}${d.url ? ` (${d.url})` : ""}`);
    }
    return parts.join("\n");
  });

  return (
    "RETRIEVED FROM ELASTICSEARCH (treat as highly authoritative — use these facts first):\n" +
    lines.join("\n\n")
  );
}

// ─── Index Health Check ──────────────────────────────────────────────────────

/** Returns true if the index exists and has at least one document. */
export async function indexReady(): Promise<boolean> {
  const client = getElasticClient();
  if (!client) return false;
  try {
    const exists = await client.indices.exists({ index: ELASTIC_INDEX });
    if (!exists) return false;
    const count = await client.count({ index: ELASTIC_INDEX });
    return count.count > 0;
  } catch {
    return false;
  }
}
