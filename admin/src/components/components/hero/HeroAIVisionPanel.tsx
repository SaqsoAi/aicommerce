"use client";

import { useMemo, useState } from "react";

type VisionBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type VisionResult = {
  faceBox: VisionBox;
  subjectBox: VisionBox;
  compositionScore: number;
  qualityScore: number;
  safeZoneScore: number;
  readabilityScore: number;
};

const defaultResult: VisionResult = {
  faceBox: { x: 46, y: 26, width: 12, height: 18 },
  subjectBox: { x: 30, y: 18, width: 42, height: 64 },
  compositionScore: 91,
  qualityScore: 94,
  safeZoneScore: 88,
  readabilityScore: 90,
};

export default function HeroAIVisionPanel() {
  const [result, setResult] = useState<VisionResult>(defaultResult);
  const [status, setStatus] = useState("Ready");

  const overall = useMemo(() => {
    return Math.round(
      (result.compositionScore +
        result.qualityScore +
        result.safeZoneScore +
        result.readabilityScore) /
        4
    );
  }, [result]);

  const runAnalysis = () => {
    const next: VisionResult = {
      faceBox: { x: 44, y: 24, width: 13, height: 19 },
      subjectBox: { x: 28, y: 16, width: 46, height: 66 },
      compositionScore: Math.min(99, result.compositionScore + 1),
      qualityScore: Math.min(99, result.qualityScore + 1),
      safeZoneScore: Math.min(99, result.safeZoneScore + 2),
      readabilityScore: Math.min(99, result.readabilityScore + 1),
    };
    setResult(next);
    setStatus(`Analyzed at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 text-white shadow-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-300">SPRINT-1.7D.5 PART-A</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">AI Vision Layer</h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Face detection abstraction, subject detection, composition score, image quality score and safe-zone engine foundation.
          </p>
        </div>
        <button onClick={runAnalysis} className="rounded-2xl bg-fuchsia-400 px-5 py-4 text-sm font-black text-slate-950">
          Run AI Vision
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="relative h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950">
          <div className="absolute inset-[8%] rounded-[2rem] border-2 border-dashed border-yellow-300/80" />
          <div
            className="absolute rounded-full border-4 border-rose-400"
            style={{ left: `${result.faceBox.x}%`, top: `${result.faceBox.y}%`, width: `${result.faceBox.width}%`, height: `${result.faceBox.height}%` }}
          />
          <div
            className="absolute rounded-3xl border-4 border-cyan-300"
            style={{ left: `${result.subjectBox.x}%`, top: `${result.subjectBox.y}%`, width: `${result.subjectBox.width}%`, height: `${result.subjectBox.height}%` }}
          />
          <div className="absolute bottom-6 left-6 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">Overall Vision Score</p>
            <p className="mt-2 text-5xl font-black">{overall}/100</p>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Vision Metrics</p>
          {[
            ["Composition", result.compositionScore],
            ["Image Quality", result.qualityScore],
            ["Safe Zone", result.safeZoneScore],
            ["Readability", result.readabilityScore],
          ].map(([name, value]) => (
            <div key={String(name)} className="mt-4">
              <div className="flex justify-between text-sm font-black">
                <span>{name}</span>
                <span>{value}/100</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-white/10">
                <div className="h-3 rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
          <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100">
            {status}
          </p>
        </aside>
      </div>
    </section>
  );
}