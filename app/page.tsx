"use client";

import { useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useChat } from "@/lib/useChat";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TrustBar from "@/components/TrustBar";
import QuickChips from "@/components/QuickChips";
import MessageBubble from "@/components/MessageBubble";
import Composer from "@/components/Composer";
import ToolsBar from "@/components/ToolsBar";
import WageCheckModal from "@/components/WageCheckModal";
import ComplaintModal from "@/components/ComplaintModal";
import ResourcesModal from "@/components/ResourcesModal";
import InstallPrompt from "@/components/InstallPrompt";

export default function Home() {
  const [lang, setLang] = useState<Lang>("hi");
  const [wageOpen, setWageOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const { messages, busy, send, stop, reset } = useChat(lang);
  const scrollRef = useRef<HTMLDivElement>(null);
  const S = t(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const empty = messages.length === 0;

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Sidebar
        lang={lang}
        onNewChat={reset}
        onWage={() => setWageOpen(true)}
        onComplaint={() => setComplaintOpen(true)}
        onResources={() => setResOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <a href="#composer" className="skip-link">
          {lang === "hi" ? "इनपुट पर जाएँ" : "Skip to input"}
        </a>

        <Header
          lang={lang}
          onLang={setLang}
          onNewChat={reset}
          canReset={messages.length > 0}
        />
        <div className="lg:hidden">
          <TrustBar lang={lang} />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-3xl px-4">
            {empty ? (
              <section className="flex flex-col items-center py-10 text-center sm:py-16">
                <span className="grid h-16 w-16 place-items-center rounded-3xl bg-primary text-white shadow-lg shadow-slate-300/50">
                  <Scale size={30} aria-hidden />
                </span>
                <h1 className="mt-5 font-heading text-[1.6rem] font-bold text-primary sm:text-3xl">
                  {S.appName} · {S.wordmarkSub}
                </h1>
                <p className="mt-3 max-w-lg text-[1.02rem] text-secondary">
                  {S.intro}
                </p>
                <div className="mt-8 w-full max-w-xl text-left">
                  <QuickChips lang={lang} onPick={send} disabled={busy} />
                </div>
              </section>
            ) : (
              <div className="space-y-5 py-5">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} lang={lang} />
                ))}
              </div>
            )}
          </main>
        </div>

        <div className="shrink-0 border-t border-border bg-surface/90 backdrop-blur-md">
          <div className="mx-auto w-full max-w-3xl space-y-2.5 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
            <div className="lg:hidden">
              <ToolsBar
                lang={lang}
                onWage={() => setWageOpen(true)}
                onComplaint={() => setComplaintOpen(true)}
                onResources={() => setResOpen(true)}
              />
            </div>
            <Composer
              lang={lang}
              busy={busy}
              showHint={empty}
              onSend={send}
              onStop={stop}
            />
          </div>
        </div>
      </div>

      <WageCheckModal open={wageOpen} onClose={() => setWageOpen(false)} lang={lang} onAsk={send} />
      <ComplaintModal open={complaintOpen} onClose={() => setComplaintOpen(false)} lang={lang} />
      <ResourcesModal open={resOpen} onClose={() => setResOpen(false)} lang={lang} />
      <InstallPrompt lang={lang} />
    </div>
  );
}
