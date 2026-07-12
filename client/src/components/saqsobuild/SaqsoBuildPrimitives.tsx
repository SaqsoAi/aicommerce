import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function SaqsoButton({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`saqso-btn ${className}`.trim()} {...props}>{children}</button>;
}

export function SaqsoInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`saqso-input ${className}`.trim()} {...props} />;
}

export function SaqsoBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`saqso-badge ${className}`.trim()}>{children}</span>;
}

export function SaqsoEmptyState({ title, description }: { title: string; description?: string }) {
  return <section className="saqso-empty-state"><h3>{title}</h3>{description ? <p>{description}</p> : null}</section>;
}

export function SaqsoSkeleton({ className = "" }: { className?: string }) {
  return <div className={`saqso-skeleton ${className}`.trim()} aria-hidden="true" />;
}

export function SaqsoErrorState({ title = "Something went wrong", description }: { title?: string; description?: string }) {
  return <section className="saqso-error-state"><h3>{title}</h3>{description ? <p>{description}</p> : null}</section>;
}