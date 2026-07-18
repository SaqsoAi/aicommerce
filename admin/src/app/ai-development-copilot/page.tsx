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

type ToolDefinition = {
  label: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  defaultPayload?: Json;
};

const TOOLS: ToolDefinition[] = [
  {
    label: "Repository",
    method: "GET",
    path: "/repository-intelligence",
    description: "Inspect repository structure, applications, modules and risk.",
  },
  {
    label: "Architecture",
    method: "GET",
    path: "/knowledge-graph",
    description: "Build the repository knowledge graph and dependency view.",
  },
  {
    label: "Visual Logic",
    method: "POST",
    path: "/visual-logic/compile",
    description: "Compile trigger, condition, approval, action and output nodes.",
    defaultPayload: {
      nodes: [
        { id: "start", type: "trigger", label: "Order created" },
        { id: "approve", type: "approval", label: "Manager approval" },
        { id: "done", type: "output", label: "Workflow completed" },
      ],
      edges: [
        { from: "start", to: "approve" },
        { from: "approve", to: "done" },
      ],
    },
  },
  {
    label: "Form Intelligence",
    method: "POST",
    path: "/forms/generate",
    description: "Generate accessible fields, validation and CRUD intent.",
    defaultPayload: {
      name: "ProductCampaignForm",
      fields: [
        { name: "title", type: "string", required: true },
        { name: "budget", type: "decimal", required: true },
        { name: "startDate", type: "date", required: true },
      ],
    },
  },
  {
    label: "Theme Intelligence",
    method: "POST",
    path: "/theme/analyze",
    description: "Audit CSS tokens, hard-coded colors and responsive rules.",
    defaultPayload: {
      css: ".card{color:#fff!important}.grid{display:grid}",
      tokens: { surface: "var(--surface)", accent: "var(--accent)" },
    },
  },
  {
    label: "Responsive",
    method: "POST",
    path: "/responsive/audit",
    description: "Audit viewport coverage, breakpoints and overflow risk.",
    defaultPayload: {
      declaredBreakpoints: [390, 768, 1024, 1440],
      hasHorizontalOverflow: false,
    },
  },
  {
    label: "Template Builder",
    method: "POST",
    path: "/templates/modern-blueprint",
    description: "Create tenant-aware storefront, landing or dashboard blueprints.",
    defaultPayload: {
      name: "Modern Commerce",
      kind: "storefront",
      tenantAware: true,
    },
  },
  {
    label: "Review",
    method: "POST",
    path: "/review",
    description: "Review a source file inside the project root.",
    defaultPayload: { file: "server/src/index.ts" },
  },
  {
    label: "Debug",
    method: "POST",
    path: "/debug",
    description: "Analyze a build or runtime error log.",
    defaultPayload: {
      log: "Paste the complete build or runtime error here.",
    },
  },
  {
    label: "Visual Audit",
    method: "POST",
    path: "/visual-audit",
    description: "Audit a UI file for visual and interface quality.",
    defaultPayload: {
      file: "admin/src/app/ai-development-copilot/page.tsx",
    },
  },
  {
    label: "Patch / Diff",
    method: "POST",
    path: "/diff/interactive-preview",
    description: "Preview exact changed lines without applying mutations.",
    defaultPayload: {
      file: "admin/src/app/page.tsx",
      next: "export default function Page(){return <main>Preview</main>}",
    },
  },
  {
    label: "Dry Run",
    method: "POST",
    path: "/execution/dry-run",
    description: "Validate planned file operations before approval.",
    defaultPayload: {
      operations: [
        {
          type: "replace",
          target: "admin/src/app/page.tsx",
          destructive: false,
        },
      ],
    },
  },
  {
    label: "Tests",
    method: "POST",
    path: "/test-plan",
    description: "Generate test cases for a feature or route.",
    defaultPayload: {
      feature: "AI Builder interface",
      framework: "vitest",
    },
  },
  {
    label: "Specialists",
    method: "POST",
    path: "/specialists/council",
    description: "Run architecture, security, database, UX and DevOps specialists.",
    defaultPayload: {
      context: {
        module: "AI Builder",
        goal: "Enterprise production certification",
      },
    },
  },
  {
    label: "Plugin Composer",
    method: "POST",
    path: "/compose-plugin",
    description: "Compose an approval-governed plugin package blueprint.",
    defaultPayload: {
      pluginKey: "saqso.example",
      name: "Example Plugin",
      version: "1.0.0",
      files: [],
    },
  },
  {
    label: "Certification",
    method: "POST",
    path: "/certification/auto-code",
    description: "Certify build, TypeScript, security and coverage evidence.",
    defaultPayload: {
      buildPassed: true,
      files: [
        {
          path: "admin/src/app/ai-development-copilot/page.tsx",
          typeErrors: 0,
          securityIssues: 0,
          testCoverage: 75,
        },
      ],
    },
  },
  {
    label: "Deployment",
    method: "GET",
    path: "/deployment-plan",
    description: "Generate deployment, validation and rollback plan.",
  },
  {
    label: "Build",
    method: "POST",
    path: "/build",
    description: "Run a controlled project build through the backend runner.",
    defaultPayload: { app: "admin" },
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
  const response = await fetch(`${API}/ai-development-copilot${path}`, {
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
  const [tab, setTab] = useState("Chat");
  const [prompt, setPrompt] = useState("");
  const [payloadText, setPayloadText] = useState("{}");
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<Json[]>([]);
  const [result, setResult] = useState<unknown>();
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "SAQSO AI Builder is ready. Chat with a live provider or select a real tool from the left.",
    },
  ]);
  const end = useRef<HTMLDivElement>(null);

  const selectedTool = useMemo(
    () => TOOLS.find((tool) => tool.label === tab),
    [tab],
  );

  useEffect(() => {
    api("/providers")
      .then((data) => setProviders(Array.isArray(data) ? data : []))
      .catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedTool) {
      setPayloadText(stringify(selectedTool.defaultPayload ?? {}));
      setError("");
    }
  }, [selectedTool]);

  async function send() {
    const value = prompt.trim();
    if (!value || busy) return;
    setMessages((current) => [
      ...current,
      { role: "user", content: value },
    ]);
    setPrompt("");
    setBusy(true);
    setError("");
    try {
      const data = await api("/live-chat", {
        method: "POST",
        body: stringify({ prompt: value }),
      });
      setResult(data);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: String(
            data?.answer ?? data?.summary ?? "Provider returned no answer.",
          ),
        },
      ]);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Request failed";
      setError(message);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `Error: ${message}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function runTool() {
    if (!selectedTool || busy) return;
    setBusy(true);
    setError("");
    try {
      let body: string | undefined;
      if (selectedTool.method === "POST") {
        const parsed = JSON.parse(payloadText || "{}");
        body = stringify(parsed);
      }
      const data = await api(selectedTool.path, {
        method: selectedTool.method,
        ...(body ? { body } : {}),
      });
      setResult(data);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Tool execution failed",
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
      window.alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new Constructor();
    recognition.lang = "bn-BD";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      setPrompt((current) =>
        `${current} ${event.results[0][0].transcript}`.trim(),
      );
    };
    recognition.start();
  }

  const toolNames = ["Chat", ...TOOLS.map((tool) => tool.label)];

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>
            SAQSO.AI / REAL TOOL ACTIVATION
          </div>
          <h1 className={styles.title}>AI Builder Command Workspace</h1>
          <p className={styles.sub}>
            Every enterprise capability is wired to its real backend endpoint.
            All source-changing operations remain preview or approval governed.
          </p>
        </div>
        <div className={styles.status}>
          <span className={styles.badge}>Real API Wiring</span>
          <span className={styles.badge}>No Auto-Mutation</span>
          <span className={styles.badge}>বাংলা + English</span>
        </div>
      </section>

      <section className={styles.grid}>
        <aside className={`${styles.panel} ${styles.nav}`}>
          <div className={styles.navTitle}>Tools</div>
          {toolNames.map((name) => (
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
          {tab === "Chat" ? (
            <>
              <div className={styles.workspaceHeader}>
                <div>
                  <h2>Provider Chat</h2>
                  <p>Architecture, code, debugging, plugin and deployment help.</p>
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
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Ask the AI Builder..."
                />
                <div className={styles.actions}>
                  <button onClick={() => void send()} disabled={busy}>
                    {busy ? "Thinking..." : "Send"}
                  </button>
                  <button className={styles.secondary} onClick={voice}>
                    Voice
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.workspaceHeader}>
                <div>
                  <h2>{selectedTool?.label}</h2>
                  <p>{selectedTool?.description}</p>
                </div>
                <div className={styles.endpoint}>
                  {selectedTool?.method} {selectedTool?.path}
                </div>
              </div>

              <div className={styles.toolBody}>
                {selectedTool?.method === "POST" ? (
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
                    This tool reads authenticated project information and
                    requires no request body.
                  </div>
                )}

                <div className={styles.actions}>
                  <button onClick={() => void runTool()} disabled={busy}>
                    {busy ? "Running..." : `Run ${selectedTool?.label}`}
                  </button>
                  <button
                    className={styles.secondary}
                    onClick={() =>
                      setPayloadText(
                        stringify(selectedTool?.defaultPayload ?? {}),
                      )
                    }
                  >
                    Reset Input
                  </button>
                </div>

                {error ? (
                  <div className={styles.error}>{error}</div>
                ) : null}
              </div>
            </>
          )}
        </section>

        <aside className={`${styles.panel} ${styles.aside}`}>
          <h3>Provider Status</h3>
          <div className={styles.providerList}>
            {providers.length ? (
              providers.map((provider, index) => (
                <div
                  className={styles.provider}
                  key={String(provider.name ?? index)}
                >
                  <b>
                    {String(
                      provider.displayName ??
                        provider.name ??
                        "Provider",
                    )}
                  </b>
                  <div
                    className={
                      provider.enabled ? styles.on : styles.off
                    }
                  >
                    {provider.enabled ? "Enabled" : "Not configured"}
                  </div>
                  <small>
                    {String(provider.defaultChatModel ?? "—")}
                  </small>
                </div>
              ))
            ) : (
              <div className={styles.muted}>No provider status loaded.</div>
            )}
          </div>

          <div className={styles.resultHeader}>
            <h3>Execution Result</h3>
            <button
              className={styles.copy}
              onClick={() =>
                navigator.clipboard.writeText(stringify(result ?? {}))
              }
            >
              Copy
            </button>
          </div>
          <pre>
            {result
              ? stringify(result)
              : "Run a tool to display the real backend response."}
          </pre>
        </aside>
      </section>
    </main>
  );
}
