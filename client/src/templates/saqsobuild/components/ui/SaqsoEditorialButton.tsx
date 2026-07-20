import Link from "next/link";
import type { ReactNode } from "react";
export default function SaqsoEditorialButton({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: "primary" | "secondary"; className?: string }) {
 return <Link href={href || "/shop"} className={`saqso-btn ${variant === "primary" ? "saqso-btn-primary" : "saqso-btn-secondary"} ${className}`}>{children}<span aria-hidden>→</span></Link>;
}
