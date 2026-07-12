"use client";

import type { ReactNode } from "react";

type SaqsoBuildPageShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
};

export default function SaqsoBuildPageShell({ children, eyebrow, title, description, className = "" }: SaqsoBuildPageShellProps) {
  return (
    <main className={`saqso-storefront saqso-page-shell ${className}`.trim()}>
      {(eyebrow || title || description) ? (
        <section className="saqso-page-hero saqso-container">
          {eyebrow ? <p className="saqso-eyebrow">{eyebrow}</p> : null}
          {title ? <h1>{title}</h1> : null}
          {description ? <p>{description}</p> : null}
        </section>
      ) : null}
      {children}
    </main>
  );
}