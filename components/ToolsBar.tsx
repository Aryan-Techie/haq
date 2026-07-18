"use client";

import { IndianRupee, FileText, Phone } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onWage: () => void;
  onComplaint: () => void;
  onResources: () => void;
}

export default function ToolsBar({ lang, onWage, onComplaint, onResources }: Props) {
  const S = t(lang);
  const btn =
    "flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:border-accent hover:bg-accent-soft cursor-pointer";
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label={S.tools}>
      <button type="button" className={btn} onClick={onWage}>
        <IndianRupee size={16} className="text-accent" aria-hidden />
        {S.wageTool}
      </button>
      <button type="button" className={btn} onClick={onComplaint}>
        <FileText size={16} className="text-accent" aria-hidden />
        {S.complaintTool}
      </button>
      <button type="button" className={btn} onClick={onResources}>
        <Phone size={16} className="text-accent" aria-hidden />
        {S.resourcesTool}
      </button>
    </div>
  );
}
