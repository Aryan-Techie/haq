"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Lang, ChatMessage } from "@/lib/types";
import CitationChips from "./CitationChips";
import ElasticChips from "./ElasticChips";
import SearchSuggestions from "./SearchSuggestions";

export default function AnswerBlock({
  message,
  lang,
}: {
  message: ChatMessage;
  lang: Lang;
}) {
  return (
    <div>
      <div className="prose-haq">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>
        {message.streaming && (
          <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent align-middle" aria-hidden />
        )}
      </div>

      {message.esHits && message.esHits.length > 0 && (
        <ElasticChips hits={message.esHits} lang={lang} />
      )}
      {message.sources && message.sources.length > 0 && (
        <CitationChips sources={message.sources} lang={lang} />
      )}
      {message.searchSuggestionsHtml && (
        <SearchSuggestions html={message.searchSuggestionsHtml} />
      )}
    </div>
  );
}
