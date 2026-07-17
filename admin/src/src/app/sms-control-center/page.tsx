"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getMessagingAnalytics,
  getMessagingAudiences,
  getMessagingCampaigns,
  getMessagingHealth,
  getMessagingLogs,
  getMessagingTemplates,
  saveMessagingAudience,
  saveMessagingTemplate,
  sendMessagingCampaign,
  sendMessagingMessage,
} from "@/services/sms.service";

type Channel = "SMS" | "WHATSAPP";

type Template = {
  id: string;
  key: string;
  channel: string;
  name: string;
  purpose: string;
  content: string;
  enabled: boolean;
};

type Audience = {
  id: string;
  name: string;
  description?: string | null;
  sourceType: string;
  enabled: boolean;
};

type Campaign = {
  id: string;
  channel: string;
  name: string;
  status: string;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
};

type Log = {
  id: string;
  channel: string;
  phone?: string | null;
  whatsapp?: string | null;
  purpose: string;
  provider?: string | null;
  providerStatus?: string | null;
  providerText?: string | null;
  providerMessageId?: string | null;
  deliveryStatus?: string | null;
  createdAt: string;
};

export default function SmsControlCenterPage() {
  const [tab, setTab] = useState<
    "dashboard" | "providers" | "send" | "templates" | "audiences" | "campaigns" | "logs"
  >("dashboard");

  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  const [channel, setChannel] = useState<Channel>("SMS");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");

  const [templateKey, setTemplateKey] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templatePurpose, setTemplatePurpose] = useState("GENERAL");
  const [templateContent, setTemplateContent] = useState("");

  const [audienceName, setAudienceName] = useState("");
  const [audienceType, setAudienceType] = useState("CUSTOM");
  const [audienceDescription, setAudienceDescription] = useState("");

  const [campaignName, setCampaignName] = useState("");
  const [campaignTargets, setCampaignTargets] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [campaignChannel, setCampaignChannel] = useState<Channel>("SMS");

  const filteredLogs = useMemo(() => logs.slice(0, 100), [logs]);

  const refresh = async () => {
    try {
      setLoading(true);

      const [
        healthRes,
        analyticsRes,
        templatesRes,
        audiencesRes,
        campaignsRes,
        logsRes,
      ] = await Promise.all([
        getMessagingHealth(),
        getMessagingAnalytics(),
        getMessagingTemplates(),
        getMessagingAudiences(),
        getMessagingCampaigns(),
        getMessagingLogs(),
      ]);

      setHealth(healthRes);
      setAnalytics(analyticsRes.data || {});
      setTemplates(templatesRes.data || []);
      setAudiences(audiencesRes.data || []);
      setCampaigns(campaignsRes.data || []);
      setLogs(logsRes.data || []);
    } catch (error) {
      console.error(error);
      alert(`Messaging load failed: ${error instanceof Error ? error.message : "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const tabClass = (name: typeof tab) =>
    tab === name
      ? "rounded-xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-zinc-950"
      : "rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900";

  const cardClass =
    "rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950";

  const inputClass =
    "rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  const handleSend = async () => {
    if (!to.trim() || !message.trim()) {
      alert("Receiver and message are required");
      return;
    }

    try {
      setLoading(true);
      await sendMessagingMessage({
        channel,
        to: to.trim(),
        message: message.trim(),
        purpose: "MANUAL",
      });

      setTo("");
      setMessage("");
      await refresh();
      alert("Message sent");
    } catch (error) {
      console.error(error);
      alert(`Send failed: ${error instanceof Error ? error.message : "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateKey.trim() || !templateName.trim() || !templateContent.trim()) {
      alert("Template key, name and content are required");
      return;
    }

    try {
      setLoading(true);

      await saveMessagingTemplate({
        key: templateKey.trim().toUpperCase(),
        channel,
        name: templateName.trim(),
        purpose: templatePurpose.trim().toUpperCase(),
        content: templateContent.trim(),
        enabled: true,
      });

      setTemplateKey("");
      setTemplateName("");
      setTemplatePurpose("GENERAL");
      setTemplateContent("");

      await refresh();
      alert("Template saved");
    } catch (error) {
      console.error(error);
      alert(`Template save failed: ${error instanceof Error ? error.message : "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAudience = async () => {
    if (!audienceName.trim()) {
      alert("Audience name is required");
      return;
    }

    try {
      setLoading(true);

      await saveMessagingAudience({
        name: audienceName.trim(),
        sourceType: audienceType.trim().toUpperCase(),
        description: audienceDescription.trim() || undefined,
        enabled: true,
      });

      setAudienceName("");
      setAudienceDescription("");
      setAudienceType("CUSTOM");

      await refresh();
      alert("Audience saved");
    } catch (error) {
      console.error(error);
      alert(`Audience save failed: ${error instanceof Error ? error.message : "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaign = async () => {
    const targets = campaignTargets
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!campaignName.trim() || !campaignMessage.trim()) {
      alert("Campaign name and message are required");
      return;
    }

    try {
      setLoading(true);

      await sendMessagingCampaign({
        channel: campaignChannel,
        name: campaignName.trim(),
        targets,
        audience: targets.length > 0 ? "CUSTOM" : "ALL_CUSTOMERS",
        message: campaignMessage.trim(),
      });

      setCampaignName("");
      setCampaignTargets("");
      setCampaignMessage("");

      await refresh();
      alert("Campaign processed");
    } catch (error) {
      console.error(error);
      alert(`Campaign failed: ${error instanceof Error ? error.message : "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6 p-6 text-zinc-900 dark:text-zinc-100">
      <section className={cardClass}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.32em] text-zinc-500">
              Super Admin Control Center
            </p>
            <h1 className="mt-2 text-3xl font-black">
              Enterprise Messaging Center
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
              Manage SMS, WhatsApp, OTP, templates, audiences, campaigns, delivery logs and analytics from one control center.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={refresh}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            ["dashboard", "Dashboard"],
            ["providers", "Providers"],
            ["send", "Send"],
            ["templates", "Templates"],
            ["audiences", "Audiences"],
            ["campaigns", "Campaigns"],
            ["logs", "Logs"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key as typeof tab)}
              className={tabClass(key as typeof tab)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {tab === "dashboard" && (
        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {[
            ["Health", health?.success ? "Online" : "Unknown"],
            ["Total", String(analytics?.total ?? 0)],
            ["SMS", String(analytics?.smsTotal ?? 0)],
            ["WhatsApp", String(analytics?.whatsappTotal ?? 0)],
            ["Sent", String(analytics?.sentTotal ?? 0)],
            ["Delivery %", `${analytics?.deliveryRate ?? 0}%`],
          ].map(([label, value]) => (
            <div key={label} className={cardClass}>
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-black">{value}</p>
            </div>
          ))}
        </section>
      )}

      {tab === "providers" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <h2 className="text-xl font-black">Songbird SMS Gateway</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p>Endpoint: http://sms.songbirdtelecom.com:8746/sendtext</p>
              <p>DLR: http://sms.songbirdtelecom.com:8746/getstatus</p>
              <p>Caller ID: ISRA</p>
              <p>TPS: 1000</p>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-xl font-black">Meta WhatsApp Cloud</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p>Provider: META_CLOUD</p>
              <p>Status: Configured</p>
              <p>Webhook: /api/messaging/webhooks/whatsapp</p>
              <p>Channel: WHATSAPP</p>
            </div>
          </div>
        </section>
      )}

      {tab === "send" && (
        <section className={cardClass}>
          <h2 className="text-xl font-black">Send Message</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)} className={inputClass}>
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>

            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="8801XXXXXXXXX"
              className={inputClass}
            />

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message content"
              className={`${inputClass} min-h-32 md:col-span-2`}
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleSend}
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Send Message
          </button>
        </section>
      )}

      {tab === "templates" && (
        <section className="space-y-6">
          <div className={cardClass}>
            <h2 className="text-xl font-black">Template Builder</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)} className={inputClass}>
                <option value="SMS">SMS</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>

              <input value={templateKey} onChange={(event) => setTemplateKey(event.target.value)} placeholder="TEMPLATE_KEY" className={inputClass} />
              <input value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="Template name" className={inputClass} />
              <input value={templatePurpose} onChange={(event) => setTemplatePurpose(event.target.value)} placeholder="Purpose" className={inputClass} />

              <textarea value={templateContent} onChange={(event) => setTemplateContent(event.target.value)} placeholder="Template content. Use {{name}}, {{otp}}, {{orderId}}" className={`${inputClass} min-h-32 md:col-span-2`} />
            </div>

            <button type="button" disabled={loading} onClick={handleSaveTemplate} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white hover:bg-purple-700 disabled:opacity-60">
              Save Template
            </button>
          </div>

          <div className={cardClass}>
            <h3 className="text-lg font-black">Saved Templates</h3>
            <div className="mt-4 grid gap-3">
              {templates.map((item) => (
                <div key={item.id} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.channel} â€¢ {item.purpose} â€¢ {item.key}</p>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold dark:bg-zinc-900">
                      {item.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "audiences" && (
        <section className="space-y-6">
          <div className={cardClass}>
            <h2 className="text-xl font-black">Audience Builder</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <input value={audienceName} onChange={(event) => setAudienceName(event.target.value)} placeholder="Audience name" className={inputClass} />
              <select value={audienceType} onChange={(event) => setAudienceType(event.target.value)} className={inputClass}>
                <option value="CUSTOM">Custom</option>
                <option value="ALL_CUSTOMERS">All Customers</option>
                <option value="MEMBERSHIP">Membership Customers</option>
                <option value="INACTIVE">Inactive Customers</option>
                <option value="ABANDONED_CART">Abandoned Cart</option>
              </select>
              <input value={audienceDescription} onChange={(event) => setAudienceDescription(event.target.value)} placeholder="Description" className={inputClass} />
            </div>

            <button type="button" disabled={loading} onClick={handleSaveAudience} className="mt-5 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-700 disabled:opacity-60">
              Save Audience
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {audiences.map((item) => (
              <div key={item.id} className={cardClass}>
                <p className="font-black">{item.name}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.sourceType}</p>
                <p className="mt-2 text-sm">{item.description || "No description"}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "campaigns" && (
        <section className="space-y-6">
          <div className={cardClass}>
            <h2 className="text-xl font-black">Campaign Manager</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <select value={campaignChannel} onChange={(event) => setCampaignChannel(event.target.value as Channel)} className={inputClass}>
                <option value="SMS">SMS</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>

              <input value={campaignName} onChange={(event) => setCampaignName(event.target.value)} placeholder="Campaign name" className={inputClass} />

              <textarea value={campaignTargets} onChange={(event) => setCampaignTargets(event.target.value)} placeholder="Manual targets comma/new line separated. Empty = ALL_CUSTOMERS" className={`${inputClass} min-h-28 md:col-span-2`} />

              <textarea value={campaignMessage} onChange={(event) => setCampaignMessage(event.target.value)} placeholder="Campaign message" className={`${inputClass} min-h-28 md:col-span-2`} />
            </div>

            <button type="button" disabled={loading} onClick={handleCampaign} className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-700 disabled:opacity-60">
              Run Campaign
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow dark:border-zinc-800 dark:bg-zinc-950">
            <table className="w-full min-w-[900px]">
              <thead className="bg-zinc-100 dark:bg-zinc-900">
                <tr>
                  <th className="p-4 text-left text-sm">Channel</th>
                  <th className="p-4 text-left text-sm">Name</th>
                  <th className="p-4 text-left text-sm">Status</th>
                  <th className="p-4 text-left text-sm">Total</th>
                  <th className="p-4 text-left text-sm">Sent</th>
                  <th className="p-4 text-left text-sm">Failed</th>
                  <th className="p-4 text-left text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((item) => (
                  <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="p-4">{item.channel}</td>
                    <td className="p-4">{item.name}</td>
                    <td className="p-4">{item.status}</td>
                    <td className="p-4">{item.totalCount}</td>
                    <td className="p-4">{item.sentCount}</td>
                    <td className="p-4">{item.failedCount}</td>
                    <td className="p-4">{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "logs" && (
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left text-sm">Channel</th>
                <th className="p-4 text-left text-sm">Receiver</th>
                <th className="p-4 text-left text-sm">Purpose</th>
                <th className="p-4 text-left text-sm">Provider</th>
                <th className="p-4 text-left text-sm">Status</th>
                <th className="p-4 text-left text-sm">Text</th>
                <th className="p-4 text-left text-sm">Message ID</th>
                <th className="p-4 text-left text-sm">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="p-4">{item.channel}</td>
                  <td className="p-4">{item.phone || item.whatsapp || "-"}</td>
                  <td className="p-4">{item.purpose}</td>
                  <td className="p-4">{item.provider || "-"}</td>
                  <td className="p-4">{item.deliveryStatus || item.providerStatus || "-"}</td>
                  <td className="p-4">{item.providerText || "-"}</td>
                  <td className="p-4">{item.providerMessageId || "-"}</td>
                  <td className="p-4">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
