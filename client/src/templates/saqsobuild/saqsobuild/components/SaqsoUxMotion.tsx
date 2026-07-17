"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function SaqsoSkeletonCard() {
  return (
    <div className="animate-pulse rounded-[2rem] border border-slate-200 bg-slate-100 p-5 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="aspect-[4/5] rounded-[1.5rem] bg-slate-200 dark:bg-white/10" />
      <div className="mt-5 h-4 w-2/3 rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="mt-3 h-3 w-1/2 rounded-full bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

export function SaqsoReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`saqso-reveal ${className}`}>
      {children}
    </div>
  );
}

export default function SaqsoUxMotion() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const current = height > 0 ? (window.scrollY / height) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, current)));
      setShowTop(window.scrollY > 700);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".saqso-reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("saqso-reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .saqso-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 700ms ease,
            transform 700ms ease;
          will-change: opacity, transform;
        }

        .saqso-reveal.saqso-reveal-in {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .saqso-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      <div className="fixed left-0 top-0 z-[9998] h-1 w-full bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-white to-amber-400 shadow-[0_0_18px_rgba(251,191,36,.55)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className={[
          "fixed bottom-6 right-6 z-[70] grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-slate-950 text-white shadow-2xl transition duration-300 dark:bg-white dark:text-black",
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        ].join(" ")}
      >
        <ArrowUp size={19} />
      </button>
    </>
  );
}