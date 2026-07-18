"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Bot, Cpu, KeyRound, RefreshCw, ShieldCheck, SlidersHorizontal, WalletCards } from "lucide-react";
import { createAiOverride, getAiDashboard, getAiSecretGovernance, seedAiControl, updateAiFeature, updateAiProvider } from "@/services/ai-control.api";
import styles from "./page.module.css";
import AiPlatformRegistry from "./AiPlatformRegistry";

type Feature = { key: string; label: string; description?: string; enabled: boolean; placement?: string[] };
type Provider = { key: string; name: string; model?: string; enabled: boolean; priority: number };
type Readiness = { key: string; configured: boolean; enabled: boolean; model?: string };
type Dashboard = { features: Feature[]; providers: Provider[]; providerReadiness?: Readiness[]; recentUsage?: unknown[]; overrides?: Array<{ id: string; featureKey: string; targetType: string; targetId: string; active: boolean }>; usageSummary?: Array<{ _sum?: { cost?: number; totalTokens?: number }; _count?: { id?: number } }> };
type SecretGovernance = { status: "PASS" | "ACTION_REQUIRED"; policyVersion: string; credentials: Array<{ name: string; configured: boolean; publiclyExposed: boolean }>; findings: Array<{ code: string; severity: string; target: string; message: string }> };

export default function AiControlCenterPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [security, setSecurity] = useState<SecretGovernance | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("Loading governed AI estate...");
  const [scope, setScope] = useState({ featureKey: "smart_search", targetType: "TENANT", targetId: "", enabled: true, reason: "" });

  const load = useCallback(async () => {
    setBusy("load");
    try { const [dashboard, governance] = await Promise.all([getAiDashboard(), getAiSecretGovernance()]); setData(dashboard); setSecurity(governance); setMessage("Control plane and secret governance synchronized."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load AI controls."); }
    finally { setBusy(""); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => ({
    enabled: data?.features.filter((item) => item.enabled).length ?? 0,
    providers: data?.providers.filter((item) => item.enabled).length ?? 0,
    configured: data?.providerReadiness?.filter((item) => item.configured).length ?? 0,
    usage: data?.usageSummary?.reduce((sum, item) => sum + Number(item._count?.id ?? 0), 0) ?? 0,
    cost: data?.usageSummary?.reduce((sum, item) => sum + Number(item._sum?.cost ?? 0), 0) ?? 0,
  }), [data]);

  async function toggleFeature(feature: Feature) {
    setBusy(feature.key);
    try { await updateAiFeature(feature.key, { enabled: !feature.enabled }); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Feature update failed."); setBusy(""); }
  }

  async function toggleProvider(provider: Provider) {
    setBusy(provider.key);
    try { await updateAiProvider(provider.key, { enabled: !provider.enabled }); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Provider update failed."); setBusy(""); }
  }

  async function addOverride() {
    if (!scope.targetId.trim()) return setMessage("Target ID is required for an override.");
    setBusy("override");
    try {
      await createAiOverride({ featureKey: scope.featureKey, targetType: scope.targetType, targetId: scope.targetId.trim(), value: { enabled: scope.enabled }, reason: scope.reason || "Platform rollout policy", active: true });
      setScope((current) => ({ ...current, targetId: "", reason: "" }));
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Override creation failed."); setBusy(""); }
  }

  async function seed() {
    setBusy("seed");
    try { await seedAiControl(); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Registry sync failed."); setBusy(""); }
  }

  return <main className={styles.page}>
    <header className={styles.hero}>
      <div><span className={styles.eyebrow}><ShieldCheck size={15}/> Platform Admin / Governed AI</span><h1>SAQSO AI Control Center</h1><p>Global registry, provider readiness, effective rollout policy, usage and tenant/store overrides.</p></div>
      <div className={styles.actions}><button onClick={seed} disabled={Boolean(busy)}><SlidersHorizontal size={16}/> Sync registry</button><button onClick={load} disabled={Boolean(busy)}><RefreshCw size={16} className={busy === "load" ? styles.spin : ""}/> Refresh</button></div>
    </header>

    <section className={styles.metrics}>
      <article><Bot/><div><strong>{summary.enabled}</strong><span>Enabled features</span></div></article>
      <article><Cpu/><div><strong>{summary.providers}</strong><span>Active providers</span></div></article>
      <article><ShieldCheck/><div><strong>{summary.configured}</strong><span>Configured providers</span></div></article>
      <article><Activity/><div><strong>{summary.usage}</strong><span>Usage events</span></div></article>
      <article><WalletCards/><div><strong>${summary.cost.toFixed(4)}</strong><span>Recorded cost</span></div></article>
      <article><KeyRound/><div><strong>{security?.status === "PASS" ? "PASS" : security?.findings.length ?? "—"}</strong><span>Secret findings</span></div></article>
    </section>

    <div className={styles.status} role="status">{message}</div>
    <section className={styles.grid}>
      <article className={styles.panel}><div className={styles.panelHead}><div><h2>AI feature registry</h2><p>Global default and client placement.</p></div><span>{data?.features.length ?? 0}</span></div>
        <div className={styles.list}>{data?.features.map((feature) => <div className={styles.row} key={feature.key}><div><b>{feature.label}</b><small>{feature.key} · {(feature.placement ?? []).join(", ") || "server"}</small></div><button className={feature.enabled ? styles.on : styles.off} disabled={Boolean(busy)} onClick={() => toggleFeature(feature)}>{feature.enabled ? "Enabled" : "Disabled"}</button></div>)}</div>
      </article>
      <article className={styles.panel}><div className={styles.panelHead}><div><h2>Provider governance</h2><p>Runtime enablement without exposing secrets.</p></div><span>{data?.providers.length ?? 0}</span></div>
        <div className={styles.list}>{data?.providers.map((provider) => { const ready = data.providerReadiness?.find((item) => item.key === provider.key); return <div className={styles.row} key={provider.key}><div><b>{provider.name}</b><small>{provider.model || "No model"} · {ready?.configured ? "Configured" : "Credential missing"}</small></div><button className={provider.enabled ? styles.on : styles.off} disabled={Boolean(busy) || ready?.configured === false} onClick={() => toggleProvider(provider)}>{provider.enabled ? "Active" : "Inactive"}</button></div>; })}</div>
      </article>
    </section>

    <section className={`${styles.panel} ${styles.security}`}><div className={styles.panelHead}><div><h2>AI-G0 secret governance</h2><p>Credential readiness is redacted. Secret values are never returned to the browser.</p></div><span className={security?.status === "PASS" ? styles.pass : styles.action}>{security?.status ?? "CHECKING"}</span></div>
      <div className={styles.securityGrid}>
        <div><h3>Runtime credentials</h3>{security?.credentials.map((credential) => <div className={styles.securityRow} key={credential.name}><code>{credential.name}</code><b className={credential.configured ? styles.good : styles.warn}>{credential.configured ? "Configured" : "Missing"}</b></div>)}</div>
        <div><h3>Source and exposure findings</h3>{security?.findings.length ? security.findings.map((finding) => <div className={styles.finding} key={`${finding.code}-${finding.target}`}><b>{finding.severity} · {finding.code}</b><span>{finding.target}</span><small>{finding.message}</small></div>) : <div className={styles.empty}>No runtime source exposure detected.</div>}</div>
      </div>
    </section>

    <AiPlatformRegistry />

    <section className={`${styles.panel} ${styles.override}`}><div className={styles.panelHead}><div><h2>Effective rollout override</h2><p>Hierarchy: Global → Plan → Tenant → Store → User. Most specific active policy wins.</p></div><span>{data?.overrides?.filter((item) => item.active).length ?? 0} active</span></div>
      <div className={styles.form}>
        <label>Feature<select value={scope.featureKey} onChange={(event) => setScope({ ...scope, featureKey: event.target.value })}>{data?.features.map((feature) => <option value={feature.key} key={feature.key}>{feature.label}</option>)}</select></label>
        <label>Scope<select value={scope.targetType} onChange={(event) => setScope({ ...scope, targetType: event.target.value })}><option>TENANT</option><option>STORE</option><option>USER</option><option>PLAN</option></select></label>
        <label>Target ID<input value={scope.targetId} onChange={(event) => setScope({ ...scope, targetId: event.target.value })} placeholder="Tenant, store, user or plan ID"/></label>
        <label>Effective state<select value={scope.enabled ? "on" : "off"} onChange={(event) => setScope({ ...scope, enabled: event.target.value === "on" })}><option value="on">Enabled</option><option value="off">Disabled</option></select></label>
        <label className={styles.reason}>Reason<input value={scope.reason} onChange={(event) => setScope({ ...scope, reason: event.target.value })} placeholder="Approval or rollout reason"/></label>
        <button onClick={addOverride} disabled={Boolean(busy)}>Create override</button>
      </div>
    </section>
  </main>;
}
