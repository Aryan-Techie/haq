"use client";

import { Phone, Building2, HandHeart, ExternalLink } from "lucide-react";
import Modal from "./Modal";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { HELPLINES, OFFICES, SCHEMES } from "@/lib/knowledge";

const telHref = (num: string) => {
  const m = num.match(/\d{3,}/);
  return m ? `tel:${m[0]}` : undefined;
};

export default function ResourcesModal({
  open,
  onClose,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}) {
  const S = t(lang);
  return (
    <Modal open={open} onClose={onClose} lang={lang} title={S.resTitle} icon={<Phone size={20} />}>
      {/* Helplines */}
      <section aria-label={S.resHelplines}>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
          <Phone size={15} className="text-accent" aria-hidden /> {S.resHelplines}
        </h3>
        <div className="flex flex-col gap-2">
          {HELPLINES.map((h) => {
            const href = telHref(h.number);
            const Card = (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-primary">{h.name}</span>
                  <span className="font-bold text-accent">{h.number}</span>
                </div>
                {h.hours && <p className="text-xs text-muted">{h.hours}</p>}
                {h.note && <p className="mt-1 text-[0.9rem] text-secondary">{h.note}</p>}
              </>
            );
            return href ? (
              <a key={h.name} href={href} className="rounded-2xl border border-border bg-surface p-3.5 transition-colors hover:border-accent cursor-pointer">
                {Card}
              </a>
            ) : (
              <div key={h.name} className="rounded-2xl border border-border bg-surface p-3.5">
                {Card}
              </div>
            );
          })}
        </div>
      </section>

      {/* Offices */}
      <section aria-label={S.resOffices} className="mt-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
          <Building2 size={15} className="text-accent" aria-hidden /> {S.resOffices}
        </h3>
        {OFFICES.map((o) => (
          <div key={o.name} className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="font-semibold text-primary">{o.name}</p>
            <p className="text-[0.9rem] text-muted">{o.address}</p>
            <p className="mt-1 text-[0.9rem] text-secondary">{o.forWhat}</p>
            {o.url && (
              <a href={o.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover">
                {S.resVisit} <ExternalLink size={13} aria-hidden />
              </a>
            )}
          </div>
        ))}
      </section>

      {/* Schemes */}
      <section aria-label={S.resSchemes} className="mt-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
          <HandHeart size={15} className="text-accent" aria-hidden /> {S.resSchemes}
        </h3>
        <div className="flex flex-col gap-2">
          {SCHEMES.map((s) => (
            <div key={s.key} className="rounded-2xl border border-border bg-surface p-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-primary">{s.name}</span>
                {s.fee && <span className="shrink-0 text-xs font-semibold text-success">{s.fee}</span>}
              </div>
              <p className="mt-0.5 text-[0.9rem] text-secondary">{s.forWhat}</p>
              <ul className="mt-1.5 flex list-disc flex-col gap-0.5 pl-5 text-[0.88rem] text-secondary marker:text-accent">
                {s.benefits.slice(0, 3).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover">
                {S.resVisit} <ExternalLink size={13} aria-hidden />
              </a>
            </div>
          ))}
        </div>
      </section>
    </Modal>
  );
}
