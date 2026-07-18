"use client";

import { useState } from "react";
import { IndianRupee, ExternalLink, ArrowRight } from "lucide-react";
import Modal from "./Modal";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { DELHI_MIN_WAGE } from "@/lib/knowledge";

const inr = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);

interface Props {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  onAsk: (prompt: string) => void;
}

export default function WageCheckModal({ open, onClose, lang, onAsk }: Props) {
  const S = t(lang);
  const [cat, setCat] = useState("unskilled");
  const [paid, setPaid] = useState("");

  const monthly = DELHI_MIN_WAGE.monthly[cat] ?? 0;
  const daily = Math.round(monthly / DELHI_MIN_WAGE.daysPerMonth);
  const paidNum = parseInt(paid.replace(/[^0-9]/g, ""), 10);
  const shortfall = !isNaN(paidNum) && paidNum > 0 && paidNum < monthly ? monthly - paidNum : 0;
  const catLabel = S.categories.find((c) => c.key === cat)?.label ?? cat;

  const ask = () => {
    const prompt =
      lang === "hi"
        ? `मैं दिल्ली में ${catLabel} का काम करता हूँ. कानूनन न्यूनतम मज़दूरी ${inr(monthly)}/माह है${
            paidNum > 0 ? ` लेकिन मुझे केवल ${inr(paidNum)}/माह मिलते हैं` : ""
          }. मेरे क्या हक़ हैं और मुझे क्या करना चाहिए?`
        : `I work as ${catLabel} in Delhi. The legal minimum wage is ${inr(monthly)}/month${
            paidNum > 0 ? ` but I am only paid ${inr(paidNum)}/month` : ""
          }. What are my rights and what should I do?`;
    onAsk(prompt);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} lang={lang} title={S.wageTitle} icon={<IndianRupee size={20} />}>
      <p className="mb-4 text-[0.95rem] text-secondary">{S.wageIntro}</p>

      <label htmlFor="wage-cat" className="mb-1.5 block text-sm font-semibold text-primary">
        {S.wageCategory}
      </label>
      <select
        id="wage-cat"
        value={cat}
        onChange={(e) => setCat(e.target.value)}
        className="mb-5 w-full rounded-2xl border border-border-strong bg-surface px-3 py-3 text-[1rem] text-primary outline-none focus:border-accent cursor-pointer"
      >
        {S.categories.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-success-soft p-4">
          <p className="text-xs font-semibold uppercase text-success">{S.wageMonthly}</p>
          <p className="mt-1 text-2xl font-bold text-primary">{inr(monthly)}</p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-4">
          <p className="text-xs font-semibold uppercase text-muted">{S.wageDaily}</p>
          <p className="mt-1 text-2xl font-bold text-primary">{inr(daily)}</p>
        </div>
      </div>

      <label htmlFor="wage-paid" className="mb-1.5 mt-5 block text-sm font-semibold text-primary">
        {S.wagePaidQ}
      </label>
      <input
        id="wage-paid"
        inputMode="numeric"
        value={paid}
        onChange={(e) => setPaid(e.target.value)}
        placeholder={S.wagePaidPlaceholder}
        className="w-full rounded-2xl border border-border-strong bg-surface px-3 py-3 text-[1rem] text-primary outline-none focus:border-accent"
      />

      {paidNum > 0 && (
        <div
          className={`mt-3 rounded-2xl p-4 text-[0.95rem] font-medium ${
            shortfall > 0 ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
          }`}
          role="status"
        >
          {shortfall > 0 ? `${S.wageShortfall} ${inr(shortfall)}/month.` : S.wageOk}
        </div>
      )}

      <button
        type="button"
        onClick={ask}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-[1rem] font-bold text-white transition-colors hover:bg-accent-hover cursor-pointer"
      >
        {S.wageAskAgent}
        <ArrowRight size={18} aria-hidden />
      </button>

      <a
        href={DELHI_MIN_WAGE.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1 text-xs text-muted hover:text-accent"
      >
        {S.wageAsOf} {DELHI_MIN_WAGE.asOf} · {DELHI_MIN_WAGE.source}
        <ExternalLink size={12} aria-hidden />
      </a>
    </Modal>
  );
}
