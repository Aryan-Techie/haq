"use client";

import { Phone, ShieldCheck } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

export default function TrustBar({ lang }: { lang: Lang }) {
  const S = t(lang);
  return (
    <div className="border-b border-border bg-surface-2">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
        <p className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted">
          <ShieldCheck size={15} className="shrink-0 text-success" aria-hidden />
          <span className="truncate">{S.disclaimer}</span>
        </p>
        <a
          href="tel:155214"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1.5 text-xs font-bold text-danger transition-colors hover:bg-red-100 cursor-pointer"
        >
          <Phone size={14} aria-hidden />
          {S.urgentHelp}
        </a>
      </div>
    </div>
  );
}
