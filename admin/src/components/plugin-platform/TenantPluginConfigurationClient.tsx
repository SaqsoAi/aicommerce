"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  getTenantEditablePluginConfiguration,
  getTenantPluginConfigurationHistory,
  getTenantPluginVisibility,
  saveTenantPluginConfigurationField,
  validateTenantPluginConfigurationField,
  type PluginConfigurationAuditEvent,
  type PluginConfigurationDocument,
  type PluginConfigurationField,
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

function parseValue(
  field: PluginConfigurationField,
  raw: string
): unknown {
  if (field.type === "NUMBER") {
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      throw new Error("A valid number is required");
    }
    return value;
  }

  if (field.type === "BOOLEAN") {
    return raw === "true";
  }

  if (field.type === "JSON") {
    return JSON.parse(raw);
  }

  return raw;
}

export default function TenantPluginConfigurationClient() {
  const [plugins, setPlugins] = useState<
    Array<{ pluginKey: string; name: string }>
  >([]);
  const [pluginKey, setPluginKey] = useState("");
  const [document, setDocument] =
    useState<PluginConfigurationDocument | null>(null);
  const [history, setHistory] =
    useState<PluginConfigurationAuditEvent[]>([]);
  const [values, setValues] =
    useState<Record<string, string>>({});
  const [reasons, setReasons] =
    useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pluginsLoaded, setPluginsLoaded] = useState(false);

  async function loadPlugins() {
    if (pluginsLoaded) return;
    try {
      const visibility = await getTenantPluginVisibility();
      setPlugins(
        visibility.plugins
          .filter(
            (plugin) =>
              plugin.enabled &&
              plugin.effectiveAccess
          )
          .map((plugin) => ({
            pluginKey: plugin.pluginKey,
            name: plugin.name,
          }))
      );
      setPluginsLoaded(true);
    } catch {
      toast.error("Unable to load plugins");
    }
  }

  async function loadConfiguration() {
    if (!pluginKey) {
      toast.error("Select a plugin");
      return;
    }

    setLoading(true);
    try {
      const [configuration, audit] = await Promise.all([
        getTenantEditablePluginConfiguration(pluginKey),
        getTenantPluginConfigurationHistory(pluginKey),
      ]);

      setDocument(configuration);
      setHistory(audit);

      const nextValues: Record<string, string> = {};
      for (const field of configuration.fields) {
        nextValues[field.key] =
          field.type === "SECRET_REFERENCE"
            ? ""
            : stringify(
                field.tenantValue ??
                  field.effectiveValue
              );
      }

      setValues(nextValues);
      setReasons({});
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Configuration unavailable"
      );
    } finally {
      setLoading(false);
    }
  }

  async function save(field: PluginConfigurationField) {
    const reason = String(
      reasons[field.key] || ""
    ).trim();

    if (reason.length < 5) {
      toast.error(
        "Reason must contain at least 5 characters"
      );
      return;
    }

    setLoading(true);
    try {
      const value = parseValue(
        field,
        values[field.key] || ""
      );

      const validation =
        await validateTenantPluginConfigurationField({
          pluginKey,
          settingKey: field.key,
          value,
        });

      if (!validation.valid) {
        toast.error(
          validation.issues[0]?.message ||
            "Configuration is invalid"
        );
        return;
      }

      await saveTenantPluginConfigurationField({
        pluginKey,
        settingKey: field.key,
        value,
        reason,
      });

      toast.success(`${field.label} saved`);
      await loadConfiguration();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save setting"
      );
    } finally {
      setLoading(false);
    }
  }

  function renderField(field: PluginConfigurationField) {
    const value = values[field.key] || "";

    if (field.type === "BOOLEAN") {
      return (
        <Select
          value={value || "false"}
          onValueChange={(next) =>
            setValues((current) => ({
              ...current,
              [field.key]: next,
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
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
          onValueChange={(next) =>
            setValues((current) => ({
              ...current,
              [field.key]: next,
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (
      field.type === "TEXTAREA" ||
      field.type === "JSON"
    ) {
      return (
        <Textarea
          value={value}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              [field.key]: event.target.value,
            }))
          }
          className={
            field.type === "JSON"
              ? "min-h-32 font-mono text-xs"
              : "min-h-24"
          }
        />
      );
    }

    return (
      <Input
        type={
          field.type === "NUMBER" ? "number" : "text"
        }
        value={value}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            [field.key]: event.target.value,
          }))
        }
        placeholder={
          field.type === "SECRET_REFERENCE"
            ? "vault:tenant/plugin/key"
            : field.description
        }
        autoComplete="off"
      />
    );
  }

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="Tenant Administration / Plugins"
        title="Plugin Settings"
        description="Manage only settings explicitly delegated to your authenticated tenant. Global and cross-tenant values are inaccessible."
      />

      <AdminCard className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
        <Select
          value={pluginKey}
          onOpenChange={(open) =>
            open && void loadPlugins()
          }
          onValueChange={setPluginKey}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select plugin" />
          </SelectTrigger>
          <SelectContent>
            {plugins.map((plugin) => (
              <SelectItem
                key={plugin.pluginKey}
                value={plugin.pluginKey}
              >
                {plugin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => void loadConfiguration()}
          disabled={loading || !pluginKey}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Settings2 />
          )}
          Load settings
        </Button>
      </AdminCard>

      {document ? (
        <>
          {!document.complete ? (
            <AdminCard className="border-amber-400/20 p-5">
              <div className="flex gap-3 text-amber-100">
                <AlertTriangle />
                <p>
                  Required configuration remains incomplete:
                  {" "}
                  {document.missingRequired.join(", ")}
                </p>
              </div>
            </AdminCard>
          ) : (
            <AdminCard className="border-emerald-400/20 p-5">
              <div className="flex gap-3 text-emerald-100">
                <CheckCircle2 />
                <p>
                  Delegated tenant configuration is complete.
                </p>
              </div>
            </AdminCard>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            {document.fields.map((field) => (
              <AdminCard
                key={field.key}
                className="space-y-4 p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-black text-white">
                      {field.label}
                    </h2>
                    <Badge variant="outline">
                      {field.inheritedFrom}
                    </Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-white/35">
                    {field.key}
                  </p>
                  {field.description ? (
                    <p className="mt-2 text-sm text-white/50">
                      {field.description}
                    </p>
                  ) : null}
                </div>

                {renderField(field)}

                <Textarea
                  value={reasons[field.key] || ""}
                  onChange={(event) =>
                    setReasons((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  placeholder="Reason for tenant configuration change"
                  className="min-h-20"
                />

                <Button
                  onClick={() => void save(field)}
                  disabled={loading}
                >
                  <Save />
                  Save tenant setting
                </Button>
              </AdminCard>
            ))}
          </div>

          <AdminTable>
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Clock3 className="text-cyan-300" />
                <h2 className="font-black text-white">
                  Tenant configuration audit
                </h2>
              </div>
            </div>

            {history.length ? (
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-5 py-4">Time</th>
                    <th className="px-5 py-4">Setting</th>
                    <th className="px-5 py-4">Reason</th>
                    <th className="px-5 py-4">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {history.map((event) => (
                    <tr key={event.id}>
                      <td className="px-5 py-4 text-white/40">
                        {event.createdAt
                          ? new Date(
                              event.createdAt
                            ).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-white/60">
                        {String(
                          event.metadata?.settingKey ||
                            "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-white/55">
                        {event.reason || "—"}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-white/35">
                        {event.actorId || "system"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-sm text-white/45">
                No tenant configuration changes recorded.
              </div>
            )}
          </AdminTable>
        </>
      ) : (
        <AdminCard className="p-8 text-sm text-white/50">
          Select an available plugin to load delegated
          tenant settings.
        </AdminCard>
      )}
    </AdminPage>
  );
}
