const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};
export type OtpPurpose =
  | "REGISTRATION"
  | "LOGIN"
  | "FORGOT_PASSWORD"
  | "CHECKOUT";

export const sendOtp = async (phone: string, purpose: OtpPurpose) => {
  const response = await fetch(`${API}/sms/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, purpose }),
  });

  return response.json();
};

export const verifyOtp = async (
  phone: string,
  otp: string,
  purpose: OtpPurpose,
) => {
  const response = await fetch(`${API}/sms/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, otp, purpose }),
  });

  return response.json();
};

export const sendMessagingMessage = async (payload: {
  channel: "SMS" | "WHATSAPP";
  to: string;
  message: string;
  purpose?: string;
}) => {
  const response = await fetch(`${API}/messaging/send`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return response.json();
};

export const getMessagingHealth = async () => {
  const response = await fetch(`${API}/messaging/health`);
  return response.json();
};

export type CommunicationPreferences = {
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  orderUpdates: boolean;
  membershipUpdates: boolean;
  rewardUpdates: boolean;
  marketingMessages: boolean;
};

const STORAGE_KEY = "ai-commerce-communication-preferences";

export const getLocalCommunicationPreferences = (): CommunicationPreferences => {
  if (typeof window === "undefined") {
    return {
      smsNotifications: true,
      whatsappNotifications: true,
      orderUpdates: true,
      membershipUpdates: true,
      rewardUpdates: true,
      marketingMessages: false,
    };
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {
      smsNotifications: true,
      whatsappNotifications: true,
      orderUpdates: true,
      membershipUpdates: true,
      rewardUpdates: true,
      marketingMessages: false,
    };
  }

  try {
    return JSON.parse(saved) as CommunicationPreferences;
  } catch {
    return {
      smsNotifications: true,
      whatsappNotifications: true,
      orderUpdates: true,
      membershipUpdates: true,
      rewardUpdates: true,
      marketingMessages: false,
    };
  }
};

export const saveLocalCommunicationPreferences = (
  preferences: CommunicationPreferences,
) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

export type CustomerMessageHistoryItem = {
  id: string;
  channel: "SMS" | "WHATSAPP" | string;
  phone?: string | null;
  whatsapp?: string | null;
  message?: string;
  purpose?: string;
  provider?: string | null;
  providerStatus?: string | null;
  providerText?: string | null;
  providerMessageId?: string | null;
  deliveryStatus?: string | null;
  createdAt?: string;
};

export const getCustomerMessageHistory = async () => {
  const response = await fetch(`${API}/messaging/logs`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return response.json();
};

export const getCustomerMessagingAnalytics = async () => {
  const response = await fetch(`${API}/messaging/analytics`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return response.json();
};

export const getCustomerQueueAnalytics = async () => {
  const response = await fetch(`${API}/messaging-queue/analytics`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return response.json();
};

export const communicationPreferenceLabels: Array<{
  key: keyof CommunicationPreferences;
  label: string;
  description: string;
}> = [
  {
    key: "smsNotifications",
    label: "SMS Notifications",
    description: "Receive important order, membership and reward updates by SMS.",
  },
  {
    key: "whatsappNotifications",
    label: "WhatsApp Notifications",
    description: "Receive order, membership and reward updates on WhatsApp.",
  },
  {
    key: "orderUpdates",
    label: "Order Updates",
    description: "Order placed, confirmed, shipped and delivered notifications.",
  },
  {
    key: "membershipUpdates",
    label: "Membership Updates",
    description: "Membership earned, upgraded and reminder notifications.",
  },
  {
    key: "rewardUpdates",
    label: "Reward Updates",
    description: "Reward earned, redeemed and balance notifications.",
  },
  {
    key: "marketingMessages",
    label: "Marketing & Cart Recovery",
    description: "Promotions, cart recovery and special offer messages.",
  },
];
