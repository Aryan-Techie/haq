"use client";

import Image from "next/image";
import { Scale, AlertTriangle } from "lucide-react";
import type { ChatMessage, Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import AnswerBlock from "./AnswerBlock";

export default function MessageBubble({
  message,
  lang,
}: {
  message: ChatMessage;
  lang: Lang;
}) {
  const S = t(lang);

  if (message.role === "user") {
    return (
      <div className="flex animate-rise justify-end">
        <div className="max-w-[85%] space-y-2">
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {message.images.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt=""
                  width={160}
                  height={160}
                  unoptimized
                  className="max-h-44 w-auto rounded-2xl border border-border object-cover shadow-sm"
                />
              ))}
            </div>
          )}
          {message.text && (
            <div className="rounded-3xl rounded-br-md bg-primary px-4 py-3 text-[1.02rem] text-white shadow-sm">
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isThinking = message.streaming && !message.text;

  return (
    <div className="flex animate-rise gap-2.5">
      <span
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
          message.error ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"
        }`}
        aria-hidden
      >
        {message.error ? <AlertTriangle size={18} /> : <Scale size={18} />}
      </span>
      <div
        className={`min-w-0 max-w-[88%] rounded-3xl rounded-tl-lg border px-4 py-3 shadow-sm ${
          message.error
            ? "border-danger-soft bg-danger-soft text-danger"
            : "border-border bg-surface"
        }`}
      >
        {isThinking ? (
          <div className="flex items-center gap-2 py-1" role="status" aria-live="polite">
            <span className="flex gap-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </span>
            <span className="text-sm text-muted">{S.thinking}</span>
          </div>
        ) : (
          <AnswerBlock message={message} lang={lang} />
        )}
      </div>
    </div>
  );
}
