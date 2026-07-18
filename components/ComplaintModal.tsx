"use client";

import { useState } from "react";
import { FileText, Copy, Download, Check, RotateCcw, AlertTriangle, Phone } from "lucide-react";
import Modal from "./Modal";
import ElasticChips from "./ElasticChips";
import type { ComplaintDraft, EsHit, Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

const ISSUE_EN: Record<string, string> = {
  unpaid_wages: "Unpaid or delayed wages",
  below_minimum: "Being paid below the statutory minimum wage",
  termination: "Unfair dismissal / wrongful termination",
  injury: "Workplace injury with no compensation received",
  no_pf_esi: "Employer not depositing PF / ESI contributions",
  other: "Labour rights issue",
};

interface Props {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}

export default function ComplaintModal({ open, onClose, lang }: Props) {
  const S = t(lang);
  const [issue, setIssue] = useState("unpaid_wages");
  const [name, setName] = useState("");
  const [employer, setEmployer] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<ComplaintDraft | null>(null);
  const [esHits, setEsHits] = useState<EsHit[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const asText = (d: ComplaintDraft) =>
    `${d.authorityName}\n${d.authorityAddress}\n\nSubject: ${d.subject}\n\n${d.body}`;

  const generate = async () => {
    setLoading(true);
    setDraft(null);
    setEsHits([]);
    setErr(null);
    try {
      const res = await fetch("/api/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue: ISSUE_EN[issue], name, employer, details, lang }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error === "no_key" ? "no_key" : "generic");
      } else {
        const j = await res.json();
        setDraft(j.draft as ComplaintDraft);
        setEsHits((j.esHits as EsHit[]) ?? []);
      }
    } catch {
      setErr("generic");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(asText(draft));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = () => {
    if (!draft) return;
    const blob = new Blob([asText(draft)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaint.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setDraft(null);
    setEsHits([]);
    setErr(null);
  };

  const field =
    "w-full rounded-2xl border border-border-strong bg-surface px-3 py-3 text-[1rem] text-primary outline-none focus:border-accent";

  return (
    <Modal open={open} onClose={onClose} lang={lang} title={S.complaintTitle} icon={<FileText size={20} />}>
      {!draft ? (
        <>
          <p className="mb-4 text-[0.95rem] text-secondary">{S.complaintIntro}</p>

          <label htmlFor="c-issue" className="mb-1.5 block text-sm font-semibold text-primary">
            {S.cIssue}
          </label>
          <select
            id="c-issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className={`${field} mb-4 cursor-pointer`}
          >
            {S.issues.map((i) => (
              <option key={i.key} value={i.key}>
                {i.label}
              </option>
            ))}
          </select>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className="mb-1.5 block text-sm font-semibold text-primary">
                {S.cName}
              </label>
              <input id="c-name" className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder={S.cNamePh} />
            </div>
            <div>
              <label htmlFor="c-emp" className="mb-1.5 block text-sm font-semibold text-primary">
                {S.cEmployer}
              </label>
              <input id="c-emp" className={field} value={employer} onChange={(e) => setEmployer(e.target.value)} placeholder={S.cEmployerPh} />
            </div>
          </div>

          <label htmlFor="c-details" className="mb-1.5 block text-sm font-semibold text-primary">
            {S.cDetails}
          </label>
          <textarea
            id="c-details"
            className={`${field} min-h-24 resize-y`}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={S.cDetailsPh}
          />

          {err && (
            <p className="mt-3 flex items-center gap-2 rounded-2xl bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger">
              <AlertTriangle size={16} aria-hidden />
              {err === "no_key" ? S.errorNoKey : S.errorGeneric}
            </p>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-[1rem] font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="flex gap-1">
                  <span className="typing-dot !bg-white" />
                  <span className="typing-dot !bg-white" />
                  <span className="typing-dot !bg-white" />
                </span>
                {S.cGenerating}
              </>
            ) : (
              S.cGenerate
            )}
          </button>
        </>
      ) : (
        <div>
          <article className="rounded-2xl border border-border bg-surface-2 p-4">
            <h3 className="text-base font-bold text-primary">{draft.title}</h3>
            <p className="mt-2 text-sm font-semibold text-secondary">{draft.authorityName}</p>
            <p className="text-sm text-muted">{draft.authorityAddress}</p>
            <p className="mt-3 text-sm font-semibold text-primary">Subject: {draft.subject}</p>
            <pre className="mt-2 whitespace-pre-wrap font-body text-[0.95rem] leading-6 text-primary">
              {draft.body}
            </pre>
          </article>

          <div className="mt-4 rounded-2xl border border-border p-4">
            <p className="text-sm font-bold text-primary">{S.cDocs}</p>
            <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5 text-[0.95rem] text-secondary marker:text-accent">
              {draft.requiredDocuments.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-bold text-primary">{S.cSubmit}</p>
            <p className="mt-1 text-[0.95rem] text-secondary">{draft.howToSubmit}</p>
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Phone size={15} aria-hidden /> {S.cHelpline}: {draft.helpline}
            </p>
          </div>

          <p className="mt-3 text-xs text-muted">{draft.disclaimer}</p>

          <ElasticChips hits={esHits} lang={lang} />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={copy} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-2 cursor-pointer">
              {copied ? <Check size={17} className="text-success" aria-hidden /> : <Copy size={17} aria-hidden />}
              {copied ? S.cCopied : S.cCopy}
            </button>
            <button type="button" onClick={download} className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-hover cursor-pointer">
              <Download size={17} aria-hidden />
              {S.cDownload}
            </button>
          </div>
          <button type="button" onClick={reset} className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-accent cursor-pointer">
            <RotateCcw size={15} aria-hidden />
            {S.complaintTitle}
          </button>
        </div>
      )}
    </Modal>
  );
}
