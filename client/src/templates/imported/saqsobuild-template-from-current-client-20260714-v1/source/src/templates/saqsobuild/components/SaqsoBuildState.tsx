"use client";

type SaqsoBuildStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function SaqsoBuildState({ title, description, actionLabel, onAction }: SaqsoBuildStateProps) {
  return (
    <section className="saqso-state-card">
      <div className="saqso-state-orb" aria-hidden="true" />
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {actionLabel ? <button type="button" className="saqso-btn saqso-btn-primary" onClick={onAction}>{actionLabel}</button> : null}
    </section>
  );
}