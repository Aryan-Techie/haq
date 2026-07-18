"use client";

import { Scale, SquarePen, IndianRupee, FileText, Phone, ShieldCheck } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onNewChat: () => void;
  onWage: () => void;
  onComplaint: () => void;
  onResources: () => void;
}

export default function Sidebar({ lang, onNewChat, onWage, onComplaint, onResources }: Props) {
  const S = t(lang);
  const item =
    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[0.95rem] font-semibold text-primary transition-colors hover:bg-accent-soft cursor-pointer";

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-sm">
          <Scale size={22} aria-hidden />
        </span>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-xl font-bold leading-none text-primary">
              {S.appName}
            </span>
            <span className="text-lg font-semibold leading-none text-accent">
              {S.wordmarkSub}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{S.tagline}</p>
        </div>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-[0.95rem] font-bold text-white transition-colors hover:bg-accent-hover cursor-pointer"
        >
          <SquarePen size={17} aria-hidden />
          {S.newChat}
        </button>
      </div>

      <nav className="mt-6 px-3">
        <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-muted">
          {S.tools}
        </p>
        <button type="button" className={item} onClick={onWage}>
          <IndianRupee size={18} className="text-accent" aria-hidden />
          {S.wageTool}
        </button>
        <button type="button" className={item} onClick={onComplaint}>
          <FileText size={18} className="text-accent" aria-hidden />
          {S.complaintTool}
        </button>
        <button type="button" className={item} onClick={onResources}>
          <Phone size={18} className="text-accent" aria-hidden />
          {S.resourcesTool}
        </button>
      </nav>

      <div className="mt-auto p-4">
        <a
          href="tel:155214"
          className="flex items-center gap-2 rounded-2xl bg-danger-soft px-3 py-3 text-sm font-bold text-danger transition-colors hover:bg-red-100 cursor-pointer"
        >
          <Phone size={16} aria-hidden />
          {S.urgentHelp}
        </a>
        <p className="mt-3 flex gap-2 px-1 text-[0.7rem] leading-4 text-muted">
          <ShieldCheck size={14} className="mt-px shrink-0 text-success" aria-hidden />
          {S.disclaimer}
        </p>
      </div>
    </aside>
  );
}
