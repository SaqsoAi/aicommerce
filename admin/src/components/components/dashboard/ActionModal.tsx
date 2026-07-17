"use client";

import { X } from "lucide-react";

export type ActionInfo = { title: string; route?: string; steps: string[] };

export default function ActionModal({ action, onClose }: { action: ActionInfo | null; onClose: () => void }) {
  if (!action) return null;
  return (
    <div className="ds-modal-overlay">
      <div className="ds-modal">
        <button type="button" className="ds-modal-close" onClick={onClose}><X size={18} /></button>
        <p>Setup Required</p>
        <h2>{action.title}</h2>
        <ol>
          {action.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        {action.route ? <small>Target route: {action.route}</small> : null}
        <button type="button" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}