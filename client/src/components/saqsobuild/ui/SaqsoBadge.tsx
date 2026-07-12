import type { ReactNode } from "react";

type SaqsoBadgeTone = "neutral" | "premium" | "success" | "warning" | "danger";

export function SaqsoBadge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: SaqsoBadgeTone; className?: string }) {
  return <span className={["saqso-badge", `saqso-badge--${tone}`, className].filter(Boolean).join(" ")}>{children}</span>;
}