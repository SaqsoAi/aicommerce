"use client";

function linePath(values: number[], width: number, height: number, pad: number): string {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(1, values.length - 1);
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export function MiniLine({ tone = "", values = [] }: { tone?: string; values?: number[] }) {
  const path = linePath(values, 150, 42, 3);
  if (!path) return null;
  return <svg className={`ds-mini-line tone-${tone}`} viewBox="0 0 150 42" preserveAspectRatio="none" aria-hidden="true"><path d={path} /></svg>;
}

export function Spark({ values = [] }: { values?: number[] }) {
  if (!values.length) return null;
  const max = Math.max(1, ...values);
  return <div className="ds-spark" aria-hidden="true">{values.slice(-5).map((value, index) => <i key={`${index}-${value}`} style={{ height: `${Math.max(3, Math.round((value / max) * 14))}px` }} />)}</div>;
}

export function ProjectChart({ points }: { points: Array<{ label: string; value: number }> }) {
  const path = linePath(points.map((point) => point.value), 760, 260, 26);
  if (!path) return null;
  return <div className="ds-project-chart"><svg viewBox="0 0 760 260" preserveAspectRatio="none" aria-label="Live project activity chart"><path className="line" d={path} /></svg></div>;
}

export function SalesChart({ points }: { points: Array<{ label: string; value: number }> }) {
  const path = linePath(points.map((point) => point.value), 760, 270, 28);
  if (!path) return null;
  return <div className="ds-sales-chart"><svg viewBox="0 0 760 270" preserveAspectRatio="none" aria-label="Live sales overview"><path className="line" d={path} /></svg><div>{points.map((point) => <span key={point.label}>{point.label}</span>)}</div></div>;
}

export function Donut({ value, label, segments = [] }: { value: string; label: string; segments?: Array<[string, string]> }) {
  const values = segments.map(([, count]) => Number(count)).filter(Number.isFinite);
  const total = values.reduce((sum, count) => sum + count, 0);
  const percentage = total > 0 && values.length ? Math.round((values[0] / total) * 100) : 0;
  return <div className="ds-donut" style={{ background: `conic-gradient(var(--accent) 0 ${percentage}%, rgba(15,23,42,.82) ${percentage}% 100%)` }}><div><strong>{value}</strong><span>{label}</span></div></div>;
}
