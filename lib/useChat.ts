"use client";

import { useCallback, useRef, useState } from "react";
import { t } from "./i18n";
import type { ChatMessage, Lang, Source, WireMessage } from "./types";
import type { PreparedImage } from "./image";

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export function useChat(lang: Lang) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;
  const abortRef = useRef<AbortController | null>(null);

  const patch = useCallback((id: string, updater: (m: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  }, []);

  const send = useCallback(
    async (text: string, images: PreparedImage[] = []) => {
      const trimmed = text.trim();
      if ((!trimmed && images.length === 0) || busy) return;
      const S = t(lang);

      const attachments = images.map(({ mime, data }) => ({ mime, data }));

      const history: WireMessage[] = [
        ...messagesRef.current
          .filter((m) => !m.error && (m.text.trim() || m.attachments?.length))
          .map((m) => ({ role: m.role, text: m.text, images: m.attachments })),
        { role: "user", text: trimmed, images: attachments },
      ];

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        text: trimmed,
        images: images.map((i) => i.preview),
        attachments,
      };
      const botId = uid();
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: botId, role: "model", text: "", streaming: true },
      ]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, lang }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let code = "generic";
          try {
            code = (await res.json()).error ?? "generic";
          } catch {
            /* ignore */
          }
          patch(botId, (m) => ({
            ...m,
            text: code === "no_key" ? S.errorNoKey : S.errorGeneric,
            error: true,
            streaming: false,
          }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const handle = (obj: { t: string; v?: string; sources?: Source[]; searchSuggestionsHtml?: string }) => {
          if (obj.t === "text" && obj.v) {
            patch(botId, (m) => ({ ...m, text: m.text + obj.v }));
          } else if (obj.t === "meta") {
            patch(botId, (m) => ({
              ...m,
              sources: obj.sources,
              searchSuggestionsHtml: obj.searchSuggestionsHtml,
              streaming: false,
            }));
          } else if (obj.t === "error") {
            patch(botId, (m) => ({
              ...m,
              text: m.text || S.errorGeneric,
              error: !m.text,
              streaming: false,
            }));
          }
        };

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const raw = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (raw) {
              try {
                handle(JSON.parse(raw));
              } catch {
                /* ignore malformed line */
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          patch(botId, (m) => ({
            ...m,
            text: m.text || t(lang).errorGeneric,
            error: !m.text,
            streaming: false,
          }));
        }
      } finally {
        patch(botId, (m) => ({ ...m, streaming: false }));
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, lang, patch]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setBusy(false);
  }, []);

  return { messages, busy, send, stop, reset };
}
