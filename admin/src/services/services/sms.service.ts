import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const getAuthConfig = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

export const getMessagingHealth = async () => {
  const response = await axios.get(`${API}/messaging/health`);
  return response.data;
};

export const getMessagingAnalytics = async () => {
  const response = await axios.get(`${API}/messaging/analytics`, getAuthConfig());
  return response.data;
};

export const getMessagingTemplates = async (channel?: string) => {
  const response = await axios.get(
    `${API}/messaging/templates${channel ? `?channel=${channel}` : ""}`,
    getAuthConfig(),
  );
  return response.data;
};

export const saveMessagingTemplate = async (payload: {
  key: string;
  channel: string;
  name: string;
  purpose: string;
  content: string;
  enabled?: boolean;
  variables?: unknown;
}) => {
  const response = await axios.post(`${API}/messaging/templates`, payload, getAuthConfig());
  return response.data;
};

export const getMessagingAudiences = async () => {
  const response = await axios.get(`${API}/messaging/audiences`, getAuthConfig());
  return response.data;
};

export const saveMessagingAudience = async (payload: {
  name: string;
  description?: string;
  sourceType: string;
  filterJson?: unknown;
  enabled?: boolean;
}) => {
  const response = await axios.post(`${API}/messaging/audiences`, payload, getAuthConfig());
  return response.data;
};

export const sendMessagingMessage = async (payload: {
  channel: "SMS" | "WHATSAPP";
  to: string;
  message?: string;
  templateKey?: string;
  variables?: Record<string, unknown>;
  purpose?: string;
}) => {
  const response = await axios.post(`${API}/messaging/send`, payload, getAuthConfig());
  return response.data;
};

export const sendMessagingCampaign = async (payload: {
  channel: "SMS" | "WHATSAPP";
  name: string;
  audience?: string;
  targets?: string[];
  message?: string;
  templateKey?: string;
  variables?: Record<string, unknown>;
}) => {
  const response = await axios.post(`${API}/messaging/campaigns`, payload, getAuthConfig());
  return response.data;
};

export const getMessagingCampaigns = async () => {
  const response = await axios.get(`${API}/messaging/campaigns`, getAuthConfig());
  return response.data;
};

export const getMessagingLogs = async (channel?: string) => {
  const response = await axios.get(
    `${API}/messaging/logs${channel ? `?channel=${channel}` : ""}`,
    getAuthConfig(),
  );
  return response.data;
};
