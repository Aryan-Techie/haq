"use client";

import { Sparkles } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onPick: (prompt: string) => void;
  disabled?: boolean;
}

export default function QuickChips({ lang, onPick, disabled }: Props) {
  const S = t(lang);
  return (
    <section aria-label={S.quickTitle} className="w-full">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-secondary">
        <Sparkles size={15} className="text-accent" aria-hidden />
        {S.quickTitle}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {S.quickPrompts.map((q) => (
          <button
            key={q.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(q.prompt)}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-left text-[0.95rem] font-medium text-primary shadow-sm transition-colors hover:border-accent hover:bg-accent-soft disabled:opacity-50 cursor-pointer"
          >
            {q.label}
          </button>
        ))}
      </div>
    </section>
  );
}
