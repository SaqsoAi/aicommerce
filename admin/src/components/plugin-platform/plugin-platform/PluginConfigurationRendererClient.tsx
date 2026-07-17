"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  KeyRound,
  Loader2,
  RefreshCw,
  Save,
  Settings2,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getPluginConfiguration,
  getPluginConfigurationHistory,
  listPlugins,
  savePluginConfigurationField,
  validatePluginConfigurationField,
  type PluginConfigurationAuditEvent,
  type PluginConfigurationDocument,
  type PluginConfigurationField,
  type PluginSummary,
} from "@/api/pluginPlatform.api";
import AdminCard from "@/components/ui/AdminCard";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminPage from "@/components/ui/AdminPage";
import AdminTable from "@/components/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function stringify(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function parseValue(field: PluginConfigurationField, raw: string): unknown {
  if (field.type === "NUMBER") {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error("A valid number is required");
    return value;
  }
  if (field.type === "BOOLEAN") return raw === "true";
  if (field.type === "JSON") {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("A JSON object is required");
    }
    return value;
  }
  return raw;
}

function date(value?: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toLocaleString();
}

export default function PluginConfigurationRendererClient() {
  const [plugins, setPlugins] = useState<PluginSummary[]>([]);
  const [pluginKey, setPluginKey] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [document, setDocument] = useState<PluginConfigurationDocument | null>(null);
  const [history, setHistory] = useState<PluginConfigurationAuditEvent[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  async function initialize() {
    if (initialized) return;
    setLoading(true);
    try {
      setPlugins(await listPlugins());
      setInitialized(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load plugins");
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    if (!pluginKey) {
      toast.error("Select a plugin");
      return;
    }
    setLoading(true);
    try {
      const [configuration, audit] = await Promise.all([
        getPluginConfiguration(pluginKey, tenantId.trim() || undefined),
        getPluginConfigurationHistory(pluginKey, tenantId.trim() || undefined),
      ]);
      setDocument(configuration);
      setHistory(audit);

      const nextValues: Record<string, string> = {};
      for (const field of configuration.fields) {
        if (field.type === "SECRET_REFERENCE") {
          nextValues[field.key] = "";
        } else if (field.scope === "TENANT" && tenantId.trim()) {
          nextValues[field.key] = stringify(field.tenantValue ?? field.effectiveValue);
        } else {
          nextValues[field.key] = stringify(field.globalValue ?? field.effectiveValue);
        }
      }
      setValues(nextValues);
      setReasons({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Configuration load failed");
    } finally {
      setLoading(false);
    }
  }

  async function save(field: PluginConfigurationField) {
    const reason = String(reasons[field.key] || "").trim();
    if (reason.length < 5) {
      toast.error("A reason of at least 5 characters is required");
      return;
    }
    if (field.scope === "TENANT" && !tenantId.trim()) {
      toast.error("Tenant ID is required for this setting");
      return;
    }

    setLoading(true);
    try {
      const value = parseValue(field, values[field.key] || "");
      const validation = await validatePluginConfigurationField({
        pluginKey,
        settingKey: field.key,
        value,
      });
      if (!validation.valid) {
        toast.error(validation.issues[0]?.message || "Configuration is invalid");
        return;
      }

      await savePluginConfigurationField({
        pluginKey,
        settingKey: field.key,
        scope: field.scope,
        tenantId: field.scope === "TENANT" ? tenantId.trim() : undefined,
        value,
        reason,
      });

      toast.success(`${field.label} saved`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save configuration");
    } finally {
      setLoading(false);
    }
  }

  const globalFields = useMemo(
    () => document?.fields.filter((field) => field.scope === "GLOBAL") || [],
    [document]
  );
  const tenantFields = useMemo(
    () => document?.fields.filter((field) => field.scope === "TENANT") || [],
    [document]
  );

  function renderControl(field: PluginConfigurationField) {
    const value = values[field.key] || "";

    if (field.type === "BOOLEAN") {
      return (
        <Select
          value={value || "false"}
          onValueChange={(next) => setValues((current) => ({ ...current, [field.key]: next }))}
        >
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "SELECT") {
      return (
        <Select
          value={value}
          onValueChange={(next) => setValues((current) => ({ ...current, [field.key]: next }))}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Select a value" /></SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (["TEXTAREA", "JSON"].includes(field.type)) {
      return (
        <Textarea
          value={value}
          onChange={(event) =>
            setValues((current) => ({ ...current, [field.key]: event.target.value }))
          }
          className={field.type === "JSON" ? "min-h-36 font-mono text-xs" : "min-h-28"}
          placeholder={field.type === "JSON" ? '{"key":"value"}' : field.description}
        />
      );
    }

    return (
      <Input
        type={field.type === "NUMBER" ? "number" : "text"}
        value={value}
        onChange={(event) =>
          setValues((current) => ({ ...current, [field.key]: event.target.value }))
        }
        placeholder={
          field.type === "SECRET_REFERENCE"
            ? "vault:plugins/vendor/secret-key"
            : field.description
        }
        autoComplete="off"
      />
    );
  }

  function fieldCard(field: PluginConfigurationField) {
    return (
      <AdminCard key={field.key} className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {field.type === "SECRET_REFERENCE" ? (
                <KeyRound className="text-amber-300" size={18} />
              ) : (
                <Settings2 className="text-cyan-300" size={18} />
              )}
              <h3 className="font-black text-white">{field.label}</h3>
            </div>
            <p className="mt-1 font-mono text-xs text-white/35">{field.key}</p>
            {field.description ? (
              <p className="mt-2 text-sm text-white/50">{field.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {field.required ? <Badge>Required</Badge> : null}
            <Badge variant="outline">{field.inheritedFrom}</Badge>
            {field.tenantAdminEditable ? (
              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                Tenant admin editable
              </Badge>
            ) : null}
          </div>
        </div>

        {field.type === "SECRET_REFERENCE" && field.secretReferenceConfigured ? (
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-3 text-sm text-emerald-100">
            A secret reference is configured. Its identifier and secret value are not revealed.
          </div>
        ) : null}

        {renderControl(field)}

        <Textarea
          value={reasons[field.key] || ""}
          onChange={(event) =>
            setReasons((current) => ({ ...current, [field.key]: event.target.value }))
          }
          placeholder="Reason for this configuration change"
          className="min-h-20"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            Effective source: {field.inheritedFrom} · type: {field.type}
          </p>
          <Button onClick={() => void save(field)} disabled={loading}>
            <Save /> Save field
          </Button>
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="System / Plugin Manager / Configuration"
        title="Plugin Configuration"
        description="Render host-controlled configuration forms from registered schemas. Tenant values inherit global values and defaults; raw secrets are never accepted."
        actions={
          <Button variant="outline" onClick={() => void load()} disabled={loading || !pluginKey}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <AdminCard className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto]">
        <Select
          value={pluginKey}
          onOpenChange={(open) => open && void initialize()}
          onValueChange={setPluginKey}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Select plugin" /></SelectTrigger>
          <SelectContent>
            {plugins.map((plugin) => (
              <SelectItem key={plugin.id} value={plugin.pluginKey}>
                {plugin.name} ({plugin.pluginKey})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
          placeholder="Tenant ID for tenant-scoped preview"
        />
        <Button onClick={() => void load()} disabled={loading || !pluginKey}>
          {loading ? <Loader2 className="animate-spin" /> : <Eye />}
          Load configuration
        </Button>
      </AdminCard>

      {document ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Completeness</p>
              <div className="mt-3 flex items-center gap-2">
                {document.complete ? (
                  <CheckCircle2 className="text-emerald-300" />
                ) : (
                  <AlertTriangle className="text-amber-300" />
                )}
                <p className="font-black text-white">
                  {document.complete ? "Complete" : `${document.missingRequired.length} missing`}
                </p>
              </div>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Global fields</p>
              <p className="mt-2 text-3xl font-black text-white">{globalFields.length}</p>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Tenant fields</p>
              <p className="mt-2 text-3xl font-black text-white">{tenantFields.length}</p>
            </AdminCard>
          </div>

          {globalFields.length ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">Global configuration</h2>
                <p className="text-sm text-white/45">Platform-wide values controlled by SUPER_ADMIN.</p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">{globalFields.map(fieldCard)}</div>
            </section>
          ) : null}

          {tenantFields.length ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">Tenant configuration</h2>
                <p className="text-sm text-white/45">
                  {tenantId.trim()
                    ? `Editing overrides for tenant ${tenantId.trim()}.`
                    : "Enter a tenant ID to edit tenant-scoped values."}
                </p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">{tenantFields.map(fieldCard)}</div>
            </section>
          ) : null}

          <AdminTable>
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Clock3 className="text-cyan-300" />
                <h2 className="font-black text-white">Configuration audit history</h2>
              </div>
            </div>
            {history.length ? (
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-5 py-4">Time</th>
                    <th className="px-5 py-4">Setting</th>
                    <th className="px-5 py-4">Scope</th>
                    <th className="px-5 py-4">Reason</th>
                    <th className="px-5 py-4">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {history.map((event) => (
                    <tr key={event.id}>
                      <td className="px-5 py-4 text-white/40">{date(event.createdAt)}</td>
                      <td className="px-5 py-4 font-mono text-xs text-white/65">
                        {String(event.metadata?.settingKey || "—")}
                      </td>
                      <td className="px-5 py-4 text-white/55">
                        {String(event.metadata?.scope || "—")}
                      </td>
                      <td className="px-5 py-4 text-white/55">{event.reason || "—"}</td>
                      <td className="px-5 py-4 font-mono text-xs text-white/35">
                        {event.actorId || "system"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-sm text-white/45">No configuration changes recorded.</div>
            )}
          </AdminTable>
        </>
      ) : (
        <AdminCard className="p-8 text-sm text-white/50">
          Select a plugin and load its registered configuration schema.
        </AdminCard>
      )}
    </AdminPage>
  );
}
