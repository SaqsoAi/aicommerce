"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Json = Record<string, unknown>;
type Message = {
  role: "user" | "assistant";
  content: string;
};

type ModuleDefinition = {
  label: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  defaultPayload?: Json;
};

const MODULES: ModuleDefinition[] = [
  {
    label: "Multi-Agent",
    method: "POST",
    path: "/agents/orchestrate",
    description: "Coordinate CEO, CFO, COO, CMO and operational specialists.",
    defaultPayload: {
      question: "What should management prioritize this month?",
      days: 30,
      agents: ["CEO", "CFO", "COO", "CMO", "INVENTORY"],
    },
  },
  {
    label: "Deep Reasoning",
    method: "POST",
    path: "/reasoning/deep",
    description: "Analyze KPI movement, root causes, opportunities and constraints.",
    defaultPayload: {
      metrics: {
        revenue: 1250000,
        orders: 3200,
        units: 5100,
        repeatRate: 0.31,
        grossMargin: 0.24,
      },
      previousMetrics: {
        revenue: 1320000,
        orders: 3450,
        units: 5300,
        repeatRate: 0.28,
        grossMargin: 0.26,
      },
      constraints: ["Budget ceiling 500000", "Inventory cover 21 days"],
    },
  },
  {
    label: "Sales",
    method: "GET",
    path: "/intelligence/sales",
    description: "Analyze authenticated sales and forecast evidence.",
  },
  {
    label: "Finance",
    method: "GET",
    path: "/intelligence/finance",
    description: "Analyze revenue, margin and financial evidence.",
  },
  {
    label: "Inventory",
    method: "GET",
    path: "/intelligence/inventory",
    description: "Analyze stock, reorder and availability evidence.",
  },
  {
    label: "Customers",
    method: "GET",
    path: "/intelligence/customers",
    description: "Analyze customer segments, retention and repeat behavior.",
  },
  {
    label: "Forecast",
    method: "GET",
    path: "/forecast?horizonDays=30",
    description: "Generate a business forecast from live tenant/store data.",
  },
  {
    label: "Scenario",
    method: "POST",
    path: "/scenarios/enterprise",
    description: "Compare worst, expected and best business scenarios.",
    defaultPayload: {
      baselineRevenue: 1200000,
      baselineUnits: 5000,
      budget: 500000,
      conversionLiftPercent: 8,
      priceChangePercent: 2,
      stockAvailabilityPercent: 92,
    },
  },
  {
    label: "Goal Planner",
    method: "POST",
    path: "/goals/enterprise-plan",
    description: "Create a weekly target, revenue and budget execution plan.",
    defaultPayload: {
      targetUnits: 20000,
      targetRevenue: 5000000,
      budget: 500000,
      currentUnits: 6200,
      currentRevenue: 1550000,
      weeks: 4,
    },
  },
  {
    label: "Memory",
    method: "GET",
    path: "/memory",
    description: "Read tenant/store/user-scoped Business AI memory.",
  },
  {
    label: "Remember Decision",
    method: "POST",
    path: "/memory",
    description: "Save a management decision, outcome or feedback.",
    defaultPayload: {
      category: "CAMPAIGN_DECISION",
      content: "Increase budget for the highest-converting campaign.",
      outcome: { expectedRevenueLiftPercent: 12 },
      feedbackScore: 5,
    },
  },
  {
    label: "Enterprise Voice",
    method: "POST",
    path: "/voice/enterprise-session",
    description: "Create a multilingual, interruption-aware voice session.",
    defaultPayload: {
      language: "bn-BD",
      transcript: "Ei masher sales performance explain koro.",
      interruption: false,
      meetingMode: true,
    },
  },
  {
    label: "Executives",
    method: "GET",
    path: "/executive-advisors",
    description: "Run the executive advisor panel against live evidence.",
  },
  {
    label: "Predictive",
    method: "POST",
    path: "/predictive-intelligence",
    description: "Estimate revenue, unit, churn and stockout outcomes.",
    defaultPayload: {
      historicalRevenue: [980000, 1100000, 1050000, 1190000, 1260000, 1320000],
      historicalUnits: [4200, 4500, 4400, 4800, 5100, 5350],
      activeCustomers: 18000,
      repeatCustomers: 6100,
      stockUnits: 14500,
      averageDailyUnits: 420,
    },
  },
  {
    label: "Reports",
    method: "POST",
    path: "/reports/management-automation",
    description: "Generate management report artifacts from live KPI evidence.",
    defaultPayload: {
      days: 30,
      type: "MONTHLY",
      title: "Monthly Management Report",
      summary: "Management performance and action report.",
      recommendations: [
        "Protect high-margin inventory.",
        "Scale channels with verified conversion.",
      ],
    },
  },
  {
    label: "Decisions",
    method: "POST",
    path: "/decisions/draft",
    description: "Create an approval-required executive decision draft.",
    defaultPayload: {
      title: "Campaign Budget Reallocation",
      recommendation: "Move 15% budget to the highest-ROAS campaign.",
      expectedImpact: "Improve revenue efficiency by 8–12%.",
      risk: "Performance may normalize after scaling.",
      budget: 500000,
    },
  },
  {
    label: "Actions",
    method: "POST",
    path: "/actions",
    description: "Create a tenant-scoped, approval-governed business action.",
    defaultPayload: {
      title: "Reorder priority inventory",
      description: "Prepare a purchase proposal for products below safety stock.",
      owner: "INVENTORY_MANAGER",
      priority: "HIGH",
      dueInDays: 3,
    },
  },
  {
    label: "Certification",
    method: "POST",
    path: "/certification/enterprise",
    description: "Certify all Business AI enterprise capability evidence.",
    defaultPayload: {
      multiAgent: true,
      deepReasoning: true,
      scenario: true,
      goalPlanner: true,
      memory: true,
      voice: true,
      reports: true,
      decisions: true,
      predictive: true,
      tenantIsolation: true,
      serverBuildPassed: true,
      adminBuildPassed: true,
    },
  },
];

function readToken() {
  return (
    localStorage.getItem("token") ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("authToken")
  );
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${API}/ai/business-intelligence${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(readToken()
        ? { Authorization: `Bearer ${readToken()}` }
        : {}),
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload?.error?.message ??
        payload?.error?.code ??
        `Request failed (${response.status})`,
    );
  }
  return payload.data;
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function Page() {
  const [tab, setTab] = useState("Advisor");
  const [input, setInput] = useState("");
  const [payloadText, setPayloadText] = useState("{}");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Business AI Advisor is connected to authenticated tenant and store data. Ask a question or run a real module.",
    },
  ]);
  const [data, setData] = useState<unknown>();
  const [snapshot, setSnapshot] = useState<Json>();
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const selectedModule = useMemo(
    () => MODULES.find((module) => module.label === tab),
    [tab],
  );

  useEffect(() => {
    api("/snapshot")
      .then((value) => setSnapshot(value))
      .catch(() => setSnapshot(undefined));
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedModule) {
      setPayloadText(stringify(selectedModule.defaultPayload ?? {}));
      setError("");
    }
  }, [selectedModule]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setMessages((current) => [
      ...current,
      { role: "user", content: text },
    ]);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const result = await api("/chat", {
        method: "POST",
        body: stringify({ message: text }),
      });
      setData(result);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: String(
            result?.directAnswer ??
              result?.headline ??
              result?.answer ??
              "Advisor returned no direct answer.",
          ),
        },
      ]);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Advisor request failed";
      setError(message);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `Error: ${message}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function runModule() {
    if (!selectedModule || busy) return;
    setBusy(true);
    setError("");
    try {
      let body: string | undefined;
      if (selectedModule.method === "POST") {
        body = stringify(JSON.parse(payloadText || "{}"));
      }
      const result = await api(selectedModule.path, {
        method: selectedModule.method,
        ...(body ? { body } : {}),
      });
      setData(result);
      if (selectedModule.label === "Memory") {
        setSnapshot((current) => ({
          ...(current ?? {}),
          memoryCount: Array.isArray(result) ? result.length : 0,
        }));
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Module execution failed",
      );
    } finally {
      setBusy(false);
    }
  }

  function voice() {
    const Constructor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Constructor) {
      window.alert("Speech recognition unavailable.");
      return;
    }
    const recognition = new Constructor();
    recognition.lang = "bn-BD";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  }

  const tabs = ["Advisor", ...MODULES.map((module) => module.label)];

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>
            TENANT BUSINESS INTELLIGENCE / REAL MODULE ACTIVATION
          </div>
          <h1 className={styles.title}>SAQSO Business AI Advisor</h1>
          <p className={styles.sub}>
            Every enterprise module is mapped to its real endpoint with
            editable inputs, evidence output, voice and printable results.
          </p>
        </div>
        <div className={styles.chips}>
          <span className={styles.chip}>Tenant Scoped</span>
          <span className={styles.chip}>Real API Wiring</span>
          <span className={styles.chip}>Approval Governed</span>
        </div>
      </section>

      <section className={styles.layout}>
        <aside className={`${styles.panel} ${styles.nav}`}>
          <div className={styles.navTitle}>Advisor Modules</div>
          {tabs.map((name) => (
            <button
              key={name}
              data-active={tab === name}
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </aside>

        <section className={`${styles.panel} ${styles.workspace}`}>
          {tab === "Advisor" ? (
            <>
              <div className={styles.workspaceHeader}>
                <div>
                  <h2>Business Advisor</h2>
                  <p>Ask in বাংলা, Banglish or English.</p>
                </div>
              </div>
              <div className={styles.messages}>
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`${styles.msg} ${
                      message.role === "user"
                        ? styles.user
                        : styles.assistant
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
                <div ref={end} />
              </div>
              <div className={styles.composer}>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Example: Amar sale kom keno? 20,000 pcs target er jonno budget plan dao."
                />
                <div className={styles.actions}>
                  <button onClick={() => void send()} disabled={busy}>
                    {busy ? "Analyzing..." : "Ask Advisor"}
                  </button>
                  <button className={styles.secondary} onClick={voice}>
                    Voice
                  </button>
                  <button
                    className={styles.secondary}
                    onClick={() => window.print()}
                  >
                    Print
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.workspaceHeader}>
                <div>
                  <h2>{selectedModule?.label}</h2>
                  <p>{selectedModule?.description}</p>
                </div>
                <div className={styles.endpoint}>
                  {selectedModule?.method} {selectedModule?.path}
                </div>
              </div>

              <div className={styles.toolBody}>
                {selectedModule?.method === "POST" ? (
                  <label className={styles.field}>
                    <span>Request JSON</span>
                    <textarea
                      className={styles.jsonEditor}
                      value={payloadText}
                      onChange={(event) =>
                        setPayloadText(event.target.value)
                      }
                      spellCheck={false}
                    />
                  </label>
                ) : (
                  <div className={styles.readOnlyNotice}>
                    This module reads live authenticated tenant/store data and
                    needs no request body.
                  </div>
                )}

                <div className={styles.actions}>
                  <button onClick={() => void runModule()} disabled={busy}>
                    {busy ? "Running..." : `Run ${selectedModule?.label}`}
                  </button>
                  <button
                    className={styles.secondary}
                    onClick={() =>
                      setPayloadText(
                        stringify(selectedModule?.defaultPayload ?? {}),
                      )
                    }
                  >
                    Reset Input
                  </button>
                  <button
                    className={styles.secondary}
                    onClick={() => window.print()}
                  >
                    Print Result
                  </button>
                </div>

                {error ? (
                  <div className={styles.error}>{error}</div>
                ) : null}
              </div>
            </>
          )}
        </section>

        <aside className={`${styles.panel} ${styles.evidence}`}>
          <h3>Live Snapshot</h3>
          <div className={styles.cards}>
            {Object.entries((snapshot?.kpis as Json) ?? {})
              .slice(0, 10)
              .map(([key, value]) => (
                <div key={key} className={styles.card}>
                  <small>{key}</small>
                  <b>{String(value)}</b>
                </div>
              ))}
          </div>

          <div className={styles.resultHeader}>
            <h3>Evidence & Result</h3>
            <button
              className={styles.copy}
              onClick={() =>
                navigator.clipboard.writeText(stringify(data ?? {}))
              }
            >
              Copy
            </button>
          </div>
          <pre>
            {data
              ? stringify(data)
              : "Ask a question or run a real intelligence module."}
          </pre>
        </aside>
      </section>
    </main>
  );
}
