"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import type { Lang } from "@/lib/types";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const COPY = {
  hi: {
    title: "फ़ोन में इंस्टॉल करें",
    body: "बिना इंटरनेट भी खुलेगा. होम स्क्रीन पर ऐप की तरह.",
    install: "इंस्टॉल करें",
    later: "बाद में",
    ios: "नीचे Share बटन दबाएँ, फिर “Add to Home Screen” चुनें.",
  },
  en: {
    title: "Install on your phone",
    body: "Opens like an app from your home screen, even offline.",
    install: "Install",
    later: "Later",
    ios: "Tap the Share button below, then choose “Add to Home Screen”.",
  },
};

export default function InstallPrompt({ lang }: { lang: Lang }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const S = COPY[lang];

  useEffect(() => {
    // register the service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const hidden = localStorage.getItem("haq-install-dismissed") === "1";
    if (standalone || hidden) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios) {
      setDismissed(false);
      return;
    }

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setDismissed(false);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  const close = () => {
    setDismissed(true);
    localStorage.setItem("haq-install-dismissed", "1");
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    close();
  };

  if (dismissed || (!deferred && !isIOS)) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-2xl">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
          <Download size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-[0.95rem] font-bold text-primary">{S.title}</p>
          <p className="mt-0.5 text-[0.85rem] leading-5 text-muted">
            {isIOS ? (
              <span className="inline-flex flex-wrap items-center gap-1">
                <Share size={13} className="inline" aria-hidden />
                {S.ios}
              </span>
            ) : (
              S.body
            )}
          </p>
          {!isIOS && (
            <button
              type="button"
              onClick={install}
              className="mt-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-accent-hover cursor-pointer"
            >
              {S.install}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={S.later}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-primary cursor-pointer"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
