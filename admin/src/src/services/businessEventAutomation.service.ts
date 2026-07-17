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

export type BusinessAutomationEventType =
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_PACKED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "MEMBERSHIP_EARNED"
  | "MEMBERSHIP_UPGRADED"
  | "REWARD_EARNED"
  | "REWARD_REDEEMED"
  | "ABANDONED_CART_30M"
  | "ABANDONED_CART_6H"
  | "ABANDONED_CART_24H";

export type BusinessAutomationRule = {
  key: BusinessAutomationEventType;
  label: string;
  group: "ORDER" | "MEMBERSHIP" | "REWARD" | "CART";
  channels: Array<"SMS" | "WHATSAPP">;
  enabled: boolean;
};

export const getBusinessAutomationHealth = async () =>
  (await axios.get(`${API}/business-events/health`, auth())).data;

export const getBusinessAutomationRules = async () =>
  (await axios.get(`${API}/business-events/rules`, auth())).data;

export const triggerOrderAutomation = async (payload: Record<string, unknown>) =>
  (await axios.post(`${API}/business-events/order`, payload, auth())).data;

export const triggerMembershipAutomation = async (
  payload: Record<string, unknown>
) =>
  (await axios.post(`${API}/business-events/membership`, payload, auth())).data;

export const triggerRewardAutomation = async (payload: Record<string, unknown>) =>
  (await axios.post(`${API}/business-events/reward`, payload, auth())).data;

export const triggerAbandonedCartAutomation = async (
  payload: Record<string, unknown>
) =>
  (await axios.post(`${API}/business-events/abandoned-cart`, payload, auth()))
    .data;

export const businessAutomationRuleGroups = [
  {
    title: "Order Automation",
    description: "Order placed, confirmed, packed, shipped and delivered events.",
    events: [
      "ORDER_PLACED",
      "ORDER_CONFIRMED",
      "ORDER_PACKED",
      "ORDER_SHIPPED",
      "ORDER_DELIVERED",
    ],
  },
  {
    title: "Membership Automation",
    description: "Membership earned and upgraded event messaging.",
    events: ["MEMBERSHIP_EARNED", "MEMBERSHIP_UPGRADED"],
  },
  {
    title: "Reward Automation",
    description: "Reward earned and redeemed event messaging.",
    events: ["REWARD_EARNED", "REWARD_REDEEMED"],
  },
  {
    title: "Cart Recovery Automation",
    description: "Abandoned cart recovery at 30 minutes, 6 hours and 24 hours.",
    events: [
      "ABANDONED_CART_30M",
      "ABANDONED_CART_6H",
      "ABANDONED_CART_24H",
    ],
  },
] as const;