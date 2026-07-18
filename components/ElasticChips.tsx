"use client";

import { Database } from "lucide-react";
import type { EsHit, Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

export default function ElasticChips({
  hits,
  lang,
}: {
  hits: EsHit[];
  lang: Lang;
}) {
  if (!hits?.length) return null;
  const S = t(lang);
  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
        <Database size={12} aria-hidden />
        {S.esRetrieved}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {hits.map((h, i) => {
          const className =
            "max-w-[15rem] truncate rounded-full border border-accent-soft bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent transition-colors";
          return h.url ? (
            <a
              key={h.title + i}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              title={h.title}
              className={`${className} hover:border-accent cursor-pointer`}
            >
              {h.title}
            </a>
          ) : (
            <span key={h.title + i} title={h.title} className={className}>
              {h.title}
            </span>
          );
        })}
      </div>
    </div>
  );
}
