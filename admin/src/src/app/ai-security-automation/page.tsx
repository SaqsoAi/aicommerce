"use client";

import React, { useMemo, useState } from "react";

type Decision = {
  recommendation: string;
  confidence: number;
  evidence: string[];
  affectedModules: string[];
  affectedFiles: string[];
  affectedTables: string[];
  affectedApis: string[];
  riskLevel: string;
  rollbackImpact: string;
  why: string;
  how: string;
  alternative: string;
  autoAction: false;
};

const modes = [
  "SECURITY_CENTER",
  "FRAUD_DETECTION",
  "SPAM_DETECTION",
  "BOT_PROTECTION",
  "SECURITY_ADVISOR",
  "WORKFLOW_AUTOMATION",
  "SCHEDULED_JOBS",
  "HEALTH_MONITORING",
  "DECISION_TRACEABILITY",
  "EXPLAINABILITY",
  "INCIDENT_CENTER",
];

export default function AiSecurityAutomationPage() {
  const [mode, setMode] = useState("SECURITY_CENTER");
  const [subject, setSubject] = useState("Black Polo Shirt reorder / suspicious activity review");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);

  const evidence = useMemo(
    () => [
      "No destructive action executed.",
      "Recommendation only; Super Admin approval required.",
      "JWT/RBAC/Ownership/Audit evidence must be reviewed before action.",
      "Rollback impact must be documented before any future patch.",
    ],
    [],
  );

  async function runAnalysis() {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/security-automation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, subject, evidence }),
      });
      const json = await response.json();
      setDecision(json?.data?.decision ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-6">
        <aside className="w-72 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Enterprise AI</p>
            <h1 className="mt-2 text-2xl font-semibold">Security + Automation</h1>
            <p className="mt-2 text-sm text-slate-400">Locked Copilot UI extension. Recommendation-only.</p>
          </div>
          <nav className="space-y-2 text-sm">
            {modes.map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                  mode === item ? "bg-cyan-400 text-slate-950" : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                {item.replace(/_/g, " ")}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <header className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Explainable AI Governance</p>
              <h2 className="mt-2 text-3xl font-semibold">Decision Traceability</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Every recommendation includes why, how, evidence, confidence, risk, affected modules and rollback impact.
                No auto block, delete, migration, deploy, git push, or destructive action.
              </p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Generate Trace"}
            </button>
          </header>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 lg:col-span-1">
              <label className="text-sm font-medium text-slate-300">Subject</label>
              <textarea
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-3 h-40 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm outline-none focus:border-cyan-300"
              />
              <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
                Human approval required. This page extends locked Copilot UI functionality only.
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 lg:col-span-2">
              {!decision ? (
                <div className="flex h-full min-h-80 items-center justify-center rounded-2xl border border-dashed border-white/10 text-slate-500">
                  Generate a traceable AI recommendation.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-xs text-slate-500">Confidence</p>
                      <p className="mt-1 text-3xl font-semibold text-cyan-300">{decision.confidence}%</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-xs text-slate-500">Risk</p>
                      <p className="mt-1 text-3xl font-semibold">{decision.riskLevel}</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-xs text-slate-500">Auto Action</p>
                      <p className="mt-1 text-3xl font-semibold text-emerald-300">NO</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Recommendation</p>
                    <p className="mt-3 text-lg">{decision.recommendation}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/[0.04] p-5">
                      <p className="font-semibold">Why</p>
                      <p className="mt-2 text-sm text-slate-400">{decision.why}</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-5">
                      <p className="font-semibold">How</p>
                      <p className="mt-2 text-sm text-slate-400">{decision.how}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-5">
                    <p className="font-semibold">Evidence</p>
                    <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-400">
                      {decision.evidence.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/[0.04] p-5">
                      <p className="font-semibold">Affected Modules</p>
                      <p className="mt-2 text-sm text-slate-400">{decision.affectedModules.join(", ")}</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-5">
                      <p className="font-semibold">Affected APIs</p>
                      <p className="mt-2 text-sm text-slate-400">{decision.affectedApis.join(", ")}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-5">
                    <p className="font-semibold">Rollback Impact</p>
                    <p className="mt-2 text-sm text-slate-400">{decision.rollbackImpact}</p>
                    <p className="mt-4 font-semibold">Alternative</p>
                    <p className="mt-2 text-sm text-slate-400">{decision.alternative}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
