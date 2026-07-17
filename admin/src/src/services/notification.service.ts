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
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId?: string | null;
  createdAt: string;
};

export type AdminNotification = Notification;

export const getNotifications = async () => {
  const res = await axios.get(
    `${API}/notifications`,
    getAuthConfig()
  );

  return res.data?.data || res.data || [];
};

export const getNotificationHistory = async () => {
  const res = await axios.get(
    `${API}/notifications/history`,
    getAuthConfig()
  );

  return res.data?.data || res.data || [];
};

export const getUnreadNotificationCount = async () => {
  const res = await axios.get(
    `${API}/notifications/unread-count`,
    getAuthConfig()
  );

  return res.data?.data?.count ?? 0;
};

export const markNotificationRead = async (id: string) => {
  const res = await axios.put(
    `${API}/notifications/read/${id}`,
    {},
    getAuthConfig()
  );

  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axios.put(
    `${API}/notifications/read-all`,
    {},
    getAuthConfig()
  );

  return res.data;
};