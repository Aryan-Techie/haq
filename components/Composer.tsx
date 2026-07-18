"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send, Square, ImagePlus, X, AlertTriangle } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { prepareImage, type PreparedImage } from "@/lib/image";

interface Props {
  lang: Lang;
  busy: boolean;
  showHint?: boolean;
  onSend: (text: string, images?: PreparedImage[]) => void;
  onStop: () => void;
}

const MAX_IMAGES = 3;

export default function Composer({ lang, busy, showHint, onSend, onStop }: Props) {
  const S = t(lang);
  const [value, setValue] = useState("");
  const [images, setImages] = useState<PreparedImage[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [value]);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setErr(null);
    const room = MAX_IMAGES - images.length;
    const chosen = Array.from(files).slice(0, room);
    const out: PreparedImage[] = [];
    for (const f of chosen) {
      try {
        out.push(await prepareImage(f));
      } catch {
        setErr(S.photoTooBig);
      }
    }
    if (out.length) setImages((prev) => [...prev, ...out]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = () => {
    if ((!value.trim() && images.length === 0) || busy) return;
    onSend(value, images);
    setValue("");
    setImages([]);
    setErr(null);
  };

  const canSend = !!value.trim() || images.length > 0;

  return (
    <div>
      <div className="rounded-[1.75rem] border border-border bg-surface p-2 shadow-lg shadow-slate-300/30 focus-within:border-accent">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 pb-2 pt-1">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <Image
                  src={img.preview}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-xl border border-border object-cover"
                />
                <button
                  type="button"
                  aria-label={S.removePhoto}
                  onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow cursor-pointer"
                >
                  <X size={13} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => pick(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || images.length >= MAX_IMAGES}
            aria-label={S.addPhoto}
            title={S.addPhoto}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-2 text-secondary transition-colors hover:bg-border hover:text-primary disabled:opacity-40 cursor-pointer"
          >
            <ImagePlus size={20} aria-hidden />
          </button>

          <label htmlFor="composer" className="sr-only">
            {S.inputPlaceholder}
          </label>
          <textarea
            id="composer"
            ref={taRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={S.inputPlaceholder}
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-3 text-[1.05rem] leading-6 text-primary outline-none placeholder:text-muted"
          />

          {busy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label={S.stop}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-white transition-colors hover:bg-primary cursor-pointer"
            >
              <Square size={17} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label={S.send}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-30 cursor-pointer"
            >
              <Send size={19} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {err && (
        <p role="status" className="mt-2 flex items-start gap-1.5 px-2 text-[0.8rem] text-danger">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
          {err}
        </p>
      )}
      {!err && showHint && (
        <p className="mt-2 px-2 text-center text-[0.78rem] leading-4 text-muted">
          {S.photoHint}
        </p>
      )}
    </div>
  );
}
