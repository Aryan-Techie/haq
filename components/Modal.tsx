"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  lang: Lang;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, lang, icon, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const S = t(lang);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl outline-none sm:rounded-3xl"
      >
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          {icon && <span className="text-accent">{icon}</span>}
          <h2 className="flex-1 text-lg font-bold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={S.close}
            className="grid h-11 w-11 place-items-center rounded-full text-secondary transition-colors hover:bg-surface-2 hover:text-primary cursor-pointer"
          >
            <X size={22} aria-hidden />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
