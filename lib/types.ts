export type Lang = "hi" | "en";

export type ChatRole = "user" | "model";

export interface Source {
  title: string;
  uri: string;
  domain?: string;
}

/** A document retrieved from the Elasticsearch "haq-knowledge" index for this request. */
export interface EsHit {
  type: string;
  title: string;
  url?: string;
}

/** An image the worker attached (base64, no data: prefix). */
export interface Attachment {
  mime: string;
  data: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  /** data: URLs, for rendering the user's own attachments. */
  images?: string[];
  /** raw base64 attachments, resent as conversation history. */
  attachments?: Attachment[];
  /** Grounded web sources (from Gemini groundingMetadata). */
  sources?: Source[];
  /** Documents Elasticsearch retrieved for this answer, if any. */
  esHits?: EsHit[];
  /** Google Search Suggestions HTML (ToS-required render). */
  searchSuggestionsHtml?: string;
  /** true while the model is still streaming this message. */
  streaming?: boolean;
  error?: boolean;
}

/** Wire format for messages sent to /api/chat. */
export interface WireMessage {
  role: ChatRole;
  text: string;
  images?: Attachment[];
}

/** Structured complaint returned by /api/complaint. */
export interface ComplaintDraft {
  title: string;
  authorityName: string;
  authorityAddress: string;
  subject: string;
  body: string;
  requiredDocuments: string[];
  helpline: string;
  howToSubmit: string;
  disclaimer: string;
}
