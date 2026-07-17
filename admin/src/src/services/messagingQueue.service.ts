import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const auth = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getQueueAnalytics = async () =>
  (await axios.get(`${API}/messaging-queue/analytics`, auth())).data;

export const getQueueItems = async (status?: string) =>
  (await axios.get(`${API}/messaging-queue/queue${status ? `?status=${status}` : ""}`, auth())).data;

export const getQueueEvents = async () =>
  (await axios.get(`${API}/messaging-queue/events`, auth())).data;

export const retryQueueItem = async (id: string) =>
  (await axios.post(`${API}/messaging-queue/queue/${id}/retry`, {}, auth())).data;

export const processQueueItem = async (id: string) =>
  (await axios.post(`${API}/messaging-queue/queue/${id}/process`, {}, auth())).data;

export const processDueQueue = async (limit = 25) =>
  (await axios.post(`${API}/messaging-queue/queue/process-due`, { limit }, auth())).data;

export const createBusinessEvent = async (payload: {
  eventKey: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  receiver?: string;
  channels?: Array<"SMS" | "WHATSAPP">;
  payloadJson?: Record<string, unknown>;
}) => (await axios.post(`${API}/messaging-queue/events`, payload, auth())).data;
