"use client";

export function MiniLine({ tone = "" }: { tone?: string }) {
  return (
    <svg className={`ds-mini-line tone-${tone}`} viewBox="0 0 150 42" preserveAspectRatio="none">
      <path d="M2 35 L20 32 L38 23 L56 27 L74 20 L92 23 L110 18 L128 22 L148 12" />
    </svg>
  );
}

export function Spark() {
  return <div className="ds-spark"><i /><i /><i /><i /><i /></div>;
}

export function ProjectChart() {
  return (
    <div className="ds-project-chart">
      <svg viewBox="0 0 760 260" preserveAspectRatio="none">
        <defs>
          <linearGradient id="projectChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="fill" d="M25 192 L140 152 L255 142 L360 72 L472 132 L588 116 L690 40 L740 26 L740 242 L25 242 Z" />
        <path className="line" d="M25 192 L140 152 L255 142 L360 72 L472 132 L588 116 L690 40 L740 26" />
        {[25,140,255,360,472,588,690,740].map((x, i) => <circle key={x} cx={x} cy={[192,152,142,72,132,116,40,26][i]} r="6" />)}
      </svg>
    </div>
  );
}

export function SalesChart() {
  return (
    <div className="ds-sales-chart">
      <svg viewBox="0 0 760 270" preserveAspectRatio="none">
        <defs>
          <linearGradient id="salesChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".40" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="fill" d="M24 220 L138 172 L252 92 L368 168 L486 92 L602 126 L736 56 L736 250 L24 250 Z" />
        <path className="line" d="M24 220 L138 172 L252 92 L368 168 L486 92 L602 126 L736 56" />
        {[24,138,252,368,486,602,736].map((x, i) => <circle key={x} cx={x} cy={[220,172,92,168,92,126,56][i]} r="7" />)}
      </svg>
      <div><span>May 18</span><span>May 19</span><span>May 20</span><span>May 21</span><span>May 22</span><span>May 23</span><span>May 24</span></div>
    </div>
  );
}

export function Donut({ value = "75%", label = "Store Health" }: { value?: string; label?: string }) {
  return <div className="ds-donut"><div><strong>{value}</strong><span>{label}</span></div></div>;
}