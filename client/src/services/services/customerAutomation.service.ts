import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const auth = () => {
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

export type CustomerAutomationTimelineItem = {
  id: string;
  type: "ORDER" | "MEMBERSHIP" | "REWARD" | "CART" | "MESSAGE";
  title: string;
  description: string;
  status: "SENT" | "PENDING" | "FAILED" | "INFO";
  channel?: "SMS" | "WHATSAPP" | "EMAIL" | "IN_APP";
  createdAt: string;
};

export const getCustomerAutomationTimeline =
  async (): Promise<CustomerAutomationTimelineItem[]> => {
    try {
      const res = await axios.get(`${API}/messaging/logs`, auth());
      const rows = Array.isArray(res.data) ? res.data : res.data?.logs || [];

      return rows.map((row: any, index: number) => ({
        id: String(row.id || index),
        type: row.eventType?.includes("ORDER")
          ? "ORDER"
          : row.eventType?.includes("MEMBERSHIP")
          ? "MEMBERSHIP"
          : row.eventType?.includes("REWARD")
          ? "REWARD"
          : row.eventType?.includes("CART")
          ? "CART"
          : "MESSAGE",
        title: row.eventType || row.title || "Automation Message",
        description:
          row.message ||
          row.description ||
          row.templateName ||
          "Business automation notification",
        status: row.status || "INFO",
        channel: row.channel || "IN_APP",
        createdAt: row.createdAt || new Date().toISOString(),
      }));
    } catch {
      return [
        {
          id: "order-timeline",
          type: "ORDER",
          title: "Order Automation Timeline",
          description: "Order placed, confirmed, packed, shipped and delivered updates will appear here.",
          status: "INFO",
          channel: "IN_APP",
          createdAt: new Date().toISOString(),
        },
        {
          id: "membership-timeline",
          type: "MEMBERSHIP",
          title: "Membership Automation Timeline",
          description: "Membership earned and upgraded messages will appear here.",
          status: "INFO",
          channel: "IN_APP",
          createdAt: new Date().toISOString(),
        },
        {
          id: "reward-timeline",
          type: "REWARD",
          title: "Reward Automation Timeline",
          description: "Reward earned and redeemed messages will appear here.",
          status: "INFO",
          channel: "IN_APP",
          createdAt: new Date().toISOString(),
        },
        {
          id: "cart-recovery",
          type: "CART",
          title: "Cart Recovery Visibility",
          description: "Abandoned cart recovery reminders will appear here.",
          status: "INFO",
          channel: "IN_APP",
          createdAt: new Date().toISOString(),
        },
      ];
    }
  };