import type { ReactNode } from "react";
import { SaqsoButton } from "./SaqsoButton";

type SaqsoStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function SaqsoEmptyState({ title, description, icon, actionLabel, onAction, className = "" }: SaqsoStateProps) {
  return (
    <section className={["saqso-state saqso-state--empty", className].filter(Boolean).join(" ")}>
      {icon ? <div className="saqso-state__icon">{icon}</div> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {actionLabel && onAction ? <SaqsoButton type="button" onClick={onAction}>{actionLabel}</SaqsoButton> : null}
    </section>
  );
}

export function SaqsoErrorState({ title, description, actionLabel, onAction, className = "" }: SaqsoStateProps) {
  return (
    <section className={["saqso-state saqso-state--error", className].filter(Boolean).join(" ")}>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {actionLabel && onAction ? <SaqsoButton type="button" variant="secondary" onClick={onAction}>{actionLabel}</SaqsoButton> : null}
    </section>
  );
}

export function SaqsoSkeleton({ className = "" }: { className?: string }) {
  return <div className={["saqso-skeleton", className].filter(Boolean).join(" ")} aria-hidden="true" />;
}

export function SaqsoLoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="saqso-loading" role="status" aria-live="polite"><span />{label}</div>;
}