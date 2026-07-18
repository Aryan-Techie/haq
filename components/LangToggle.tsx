"use client";

import { Languages } from "lucide-react";
import type { Lang } from "@/lib/types";

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export default function LangToggle({ lang, onChange }: Props) {
  return (
    <div
      className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
      role="group"
      aria-label="Language"
    >
      <Languages size={16} className="ml-1.5 mr-0.5 text-muted" aria-hidden />
      {(
        [
          ["hi", "हिंदी"],
          ["en", "EN"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={lang === value}
          onClick={() => onChange(value)}
          className={`min-w-11 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
            lang === value
              ? "bg-primary text-white"
              : "text-secondary hover:bg-surface-2"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
