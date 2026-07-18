"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function PwaLifecycle() {
  const [online, setOnline] = useState(true);
  const [install, setInstall] = useState<InstallEvent | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstall = (event: Event) => { event.preventDefault(); setInstall(event as InstallEvent); };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstall);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstall);
    };
  }, []);

  const requestInstall = async () => {
    if (!install) return;
    await install.prompt();
    await install.userChoice;
    setInstall(null);
  };

  return (
    <>
      {!online ? <div role="status" className="fixed inset-x-3 top-[calc(var(--ai-header-h-mobile)+.5rem)] z-[100] rounded-lg bg-amber-400 px-4 py-3 text-center text-xs font-black text-black shadow-xl sm:top-[calc(var(--ai-header-h-tablet)+.5rem)]">You are offline. Cart browsing remains available; checkout requires a connection.</div> : null}
      {install ? <button type="button" onClick={requestInstall} className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 z-[66] rounded-full bg-rose-600 px-4 py-3 text-xs font-black text-white shadow-xl md:bottom-5">Install app</button> : null}
    </>
  );
}
