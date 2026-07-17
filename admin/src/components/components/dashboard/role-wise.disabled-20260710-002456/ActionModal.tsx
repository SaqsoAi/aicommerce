"use client";

import { X } from "lucide-react";

export type ActionInfo = {
  title: string;
  route?: string;
  steps: string[];
};

export default function ActionModal({
  action,
  onClose,
}: {
  action: ActionInfo | null;
  onClose: () => void;
}) {
  if (!action) return null;

  return (
    <div className="ds-modal-overlay" role="dialog" aria-modal="true">
      <div className="ds-modal">
        <button className="ds-modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <p>Action Preview</p>
        <h3>{action.title}</h3>
        <ul>
          {action.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <div className="ds-modal-actions">
          <button className="ds-btn" type="button" onClick={onClose}>
            Close
          </button>
          {action.route ? (
            <button className="ds-btn primary" type="button" onClick={() => { window.location.href = action.route!; }}>
              Open Module
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
