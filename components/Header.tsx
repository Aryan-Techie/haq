"use client";

import { Scale, SquarePen } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import LangToggle from "./LangToggle";

interface Props {
  lang: Lang;
  onLang: (lang: Lang) => void;
  onNewChat: () => void;
  canReset: boolean;
}

export default function Header({ lang, onLang, onNewChat, canReset }: Props) {
  const S = t(lang);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))]">
        {/* brand — desktop shows it in the sidebar instead */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:hidden">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-sm">
            <Scale size={20} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold leading-none text-primary">
                {S.appName}
              </span>
              <span className="text-base font-semibold leading-none text-accent">
                {S.wordmarkSub}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden flex-1 lg:block" />

        <button
          type="button"
          onClick={onNewChat}
          disabled={!canReset}
          className="flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-semibold text-primary transition-colors hover:border-accent hover:bg-accent-soft disabled:opacity-40 cursor-pointer"
        >
          <SquarePen size={16} aria-hidden />
          <span className="hidden sm:inline">{S.newChat}</span>
        </button>

        <LangToggle lang={lang} onChange={onLang} />
      </div>
    </header>
  );
}
