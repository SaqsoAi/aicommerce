"use client";

import { useCallback, useEffect, useState } from "react";

type Run = {
  id: string;
  template_key: string;
  source_name: string;
  framework: string;
  status: string;
  current_stage: string;
  publish_ready: boolean;
  created_at: string;
};

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

function headers(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: { ...headers(), ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }
  return (body?.data ?? body) as T;
}

const panel: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,.18)",
  background: "rgba(15,23,42,.72)",
  borderRadius: 16,
  padding: 18,
  minWidth: 0,
};

const button: React.CSSProperties = {
  minHeight: 42,
  padding: "9px 13px",
  borderRadius: 9,
  border: "1px solid rgba(148,163,184,.25)",
  background: "#101b2f",
  color: "#e5eefc",
};

export default function MigrationEnterpriseControlCenter(): React.ReactElement {
  const [runs, setRuns] = useState<Run[]>([]);
  const [capabilities, setCapabilities] = useState<any>(null);
  const [templateKey, setTemplateKey] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [runData, capabilityData] = await Promise.all([
      request<Run[]>("/migration-enterprise/runs"),
      request<any>("/migration-enterprise/capabilities"),
    ]);
    setRuns(runData || []);
    setCapabilities(capabilityData);
  }, []);

  useEffect(() => {
    void load().catch((reason) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
  }, [load]);

  async function createRun(): Promise<void> {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await request("/migration-enterprise/runs", {
        method: "POST",
        body: JSON.stringify({ templateKey, sourceName }),
      });
      setTemplateKey("");
      setSourceName("");
      setMessage("Migration run created.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        padding: "clamp(12px,2vw,24px)",
        color: "#e5eefc",
        overflowX: "clip",
      }}
    >
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto",
          gap: 16,
          alignItems: "start",
          marginBottom: 18,
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#67e8f9", letterSpacing: ".14em", fontSize: 12 }}>
            SUPER ADMIN / AI PLATFORM MIGRATOR
          </p>
          <h1 style={{ margin: "6px 0" }}>Enterprise Migration Certification</h1>
          <p style={{ margin: 0, color: "#94a3b8" }}>
            Upload-to-production orchestration with fail-closed certification.
          </p>
        </div>
        <button style={button} onClick={() => void load()} disabled={busy}>
          Refresh
        </button>
      </header>

      {error ? <p style={{ ...panel, borderColor: "#7f1d1d", color: "#fecaca" }}>{error}</p> : null}
      {message ? <p style={{ ...panel, borderColor: "#065f46", color: "#a7f3d0" }}>{message}</p> : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <article style={panel}>
          <h2>Create Migration Run</h2>
          <label style={{ display: "grid", gap: 6, marginBottom: 10 }}>
            Template key
            <input
              value={templateKey}
              onChange={(event) => setTemplateKey(event.target.value)}
              style={{ ...button, width: "100%" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
            Source archive name
            <input
              value={sourceName}
              onChange={(event) => setSourceName(event.target.value)}
              style={{ ...button, width: "100%" }}
            />
          </label>
          <button
            style={{ ...button, width: "100%" }}
            disabled={busy || !templateKey || !sourceName}
            onClick={() => void createRun()}
          >
            Create Certified Run
          </button>
        </article>

        <article style={panel}>
          <h2>Engine Policy</h2>
          <p>Version: {capabilities?.engineVersion || "Loading"}</p>
          <p>Stages: {capabilities?.stages?.length || 0}</p>
          <p>Activation gates: {capabilities?.activationGates?.length || 0}</p>
          <p>Database execution: PowerShell only</p>
          <p>Code execution: Plugin transaction only</p>
        </article>
      </section>

      <section style={panel}>
        <h2>Migration Runs</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
            gap: 12,
          }}
        >
          {runs.map((run) => (
            <article key={run.id} style={{ ...panel, padding: 14 }}>
              <strong>{run.template_key}</strong>
              <p style={{ color: "#94a3b8", overflowWrap: "anywhere" }}>{run.source_name}</p>
              <div>{run.framework}</div>
              <div>{run.current_stage}</div>
              <div style={{ color: run.publish_ready ? "#34d399" : "#fbbf24" }}>
                {run.publish_ready ? "PUBLISH READY" : run.status}
              </div>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 720px) {
          header {
            grid-template-columns: 1fr !important;
          }
          header button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
