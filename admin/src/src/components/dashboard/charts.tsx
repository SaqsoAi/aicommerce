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

export function ProjectChart({ points }: { points: Array<{ label: string; value: number; commits?: number; issues?: number; pullRequests?: number; codeReviews?: number }> }) {
  const values = points.map((point) => point.value);
  const path = linePath(values, 760, 250, 34);
  if (!path) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const areaPath = `${path} L726 216 L34 216 Z`;
  const totals = points.reduce(
    (sum, point) => ({
      commits: sum.commits + Number(point.commits || 0),
      issues: sum.issues + Number(point.issues || 0),
      pullRequests: sum.pullRequests + Number(point.pullRequests || 0),
      codeReviews: sum.codeReviews + Number(point.codeReviews || 0),
    }),
    { commits: 0, issues: 0, pullRequests: 0, codeReviews: 0 },
  );
  return (
    <div className="ds-project-chart">
      <svg viewBox="0 0 760 250" preserveAspectRatio="none" aria-label="Live project activity chart">
        {[0, 20, 40, 60, 80, 100].map((tick) => <g key={tick}><line className="grid" x1="34" x2="726" y1={216 - tick * 1.82} y2={216 - tick * 1.82} /><text x="10" y={221 - tick * 1.82}>{tick}</text></g>)}
        <path className="area" d={areaPath} />
        <path className="line" d={path} />
        {values.map((value, index) => {
          const x = 34 + (index * (760 - 68)) / Math.max(1, values.length - 1);
          const y = 216 - ((value - min) / range) * 182;
          return <circle key={`${points[index]?.label}-${index}`} cx={x} cy={y} r="4" />;
        })}
      </svg>
      <div className="ds-project-chart-labels">{points.map((point) => <span key={point.label}>{point.label}</span>)}</div>
      <div className="ds-project-chart-legend" aria-label="Project activity totals">
        <span><i className="commits" />Commits <b>{totals.commits}</b></span>
        <span><i className="issues" />Issues <b>{totals.issues}</b></span>
        <span><i className="prs" />Pull Requests <b>{totals.pullRequests}</b></span>
        <span><i className="reviews" />Code Reviews <b>{totals.codeReviews}</b></span>
      </div>
    </div>
  );
}

export function SalesChart({ points }: { points: Array<{ label: string; value: number }> }) {
  const path = linePath(points.map((point) => point.value), 760, 270, 28);
  if (!path) return null;
  return <div className="ds-sales-chart"><svg viewBox="0 0 760 270" preserveAspectRatio="none" aria-label="Live sales overview"><path className="line" d={path} /></svg><div>{points.map((point) => <span key={point.label}>{point.label}</span>)}</div></div>;
}

export function Donut({ value, label, segments = [] }: { value: string; label: string; segments?: Array<[string, string]> }) {
  const colors = ["#22c55e", "#2563eb", "#f59e0b", "#7c3aed", "#ef4444", "#06b6d4"];
  const values = segments
    .map(([, count]) => Number(count))
    .map((count) => (Number.isFinite(count) && count > 0 ? count : 0));
  const total = values.reduce((sum, count) => sum + count, 0);
  let cursor = 0;
  const stops = values.flatMap((count, index) => {
    if (total <= 0 || count <= 0) return [];
    const start = cursor;
    cursor += (count / total) * 100;
    return [`${colors[index % colors.length]} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`];
  });
  const background = stops.length
    ? `conic-gradient(${stops.join(", ")})`
    : "conic-gradient(rgba(71, 85, 105, .7) 0 100%)";

  return <div className="ds-donut" style={{ background }}><div><strong>{value}</strong><span>{label}</span></div></div>;
}

