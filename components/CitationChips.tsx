"use client";

import { ExternalLink } from "lucide-react";
import type { Lang, Source } from "@/lib/types";
import { t } from "@/lib/i18n";

export default function CitationChips({
  sources,
  lang,
}: {
  sources: Source[];
  lang: Lang;
}) {
  if (!sources?.length) return null;
  const S = t(lang);
  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        {S.sources}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <a
            key={s.uri + i}
            href={s.uri}
            target="_blank"
            rel="noopener noreferrer"
            title={s.title}
            className="flex max-w-[15rem] items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-secondary transition-colors hover:border-accent hover:text-accent cursor-pointer"
          >
            <ExternalLink size={12} className="shrink-0" aria-hidden />
            <span className="truncate">{s.domain || s.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
