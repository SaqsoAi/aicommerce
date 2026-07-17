"use client";

import { useMemo, useState } from "react";

type WorkflowStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "SCHEDULED";

type WorkflowState = {
  status: WorkflowStatus;
  publishAt: string;
  approvalNote: string;
  lockedVersion: string;
  lastSavedAt: string;
};

const statusMeta: Record<WorkflowStatus, { label: string; text: string }> = {
  DRAFT: {
    label: "Draft",
    text: "Safe working version. Not visible to customers.",
  },
  REVIEW: {
    label: "Review",
    text: "Ready for approval before publish.",
  },
  PUBLISHED: {
    label: "Published",
    text: "Live hero state for storefront.",
  },
  SCHEDULED: {
    label: "Scheduled",
    text: "Will publish at selected date/time.",
  },
};

export default function HeroWorkflowPanel() {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    status: "DRAFT",
    publishAt: "",
    approvalNote: "Ready for enterprise review.",
    lockedVersion: "v4.2",
    lastSavedAt: "",
  });

  const steps = useMemo(
    () => [
      { key: "DRAFT", title: "Draft", done: ["DRAFT", "REVIEW", "PUBLISHED", "SCHEDULED"].includes(workflow.status) },
      { key: "REVIEW", title: "Review", done: ["REVIEW", "PUBLISHED", "SCHEDULED"].includes(workflow.status) },
      { key: "PUBLISHED", title: "Publish", done: workflow.status === "PUBLISHED" },
      { key: "SCHEDULED", title: "Schedule", done: workflow.status === "SCHEDULED" },
    ],
    [workflow.status]
  );

  const saveDraft = () => {
    setWorkflow((prev) => ({
      ...prev,
      status: "DRAFT",
      lastSavedAt: new Date().toLocaleTimeString(),
    }));
  };

  const sendReview = () => {
    setWorkflow((prev) => ({
      ...prev,
      status: "REVIEW",
      lastSavedAt: new Date().toLocaleTimeString(),
    }));
  };

  const publishNow = () => {
    setWorkflow((prev) => ({
      ...prev,
      status: "PUBLISHED",
      publishAt: "",
      lastSavedAt: new Date().toLocaleTimeString(),
    }));
  };

  const schedulePublish = () => {
    setWorkflow((prev) => ({
      ...prev,
      status: "SCHEDULED",
      publishAt: prev.publishAt || new Date().toISOString().slice(0, 16),
      lastSavedAt: new Date().toLocaleTimeString(),
    }));
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 text-white shadow-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
            SPRINT-1.7D.3
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            Draft / Review / Publish / Schedule Workflow
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Enterprise workflow layer for hero approval, version lock, scheduling, and publish readiness.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm font-black text-emerald-100">
          Current: {statusMeta[workflow.status].label}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.key}
                className={`rounded-2xl border p-4 ${
                  step.done
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                  Step
                </p>
                <p className="mt-2 text-lg font-black">{step.title}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button onClick={saveDraft} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-black">
              Save Draft
            </button>
            <button onClick={sendReview} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-4 text-sm font-black text-cyan-100">
              Send Review
            </button>
            <button onClick={publishNow} className="rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-slate-950">
              Publish Now
            </button>
            <button onClick={schedulePublish} className="rounded-2xl bg-violet-500 px-5 py-4 text-sm font-black">
              Schedule
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Publish Date / Time
              <input
                type="datetime-local"
                value={workflow.publishAt}
                onChange={(event) =>
                  setWorkflow((prev) => ({ ...prev, publishAt: event.target.value }))
                }
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none"
              />
            </label>

            <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Locked Version
              <input
                value={workflow.lockedVersion}
                onChange={(event) =>
                  setWorkflow((prev) => ({ ...prev, lockedVersion: event.target.value }))
                }
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none"
              />
            </label>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-300">
            Workflow Inspector
          </p>

          <h4 className="mt-3 text-xl font-black">
            {statusMeta[workflow.status].label}
          </h4>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            {statusMeta[workflow.status].text}
          </p>

          <textarea
            value={workflow.approvalNote}
            onChange={(event) =>
              setWorkflow((prev) => ({ ...prev, approvalNote: event.target.value }))
            }
            className="mt-5 h-28 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none"
          />

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Last Saved</p>
              <p className="mt-1 font-black">{workflow.lastSavedAt || "Not saved yet"}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Schedule</p>
              <p className="mt-1 font-black">{workflow.publishAt || "No schedule set"}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}