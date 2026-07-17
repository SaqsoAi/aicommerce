import api from "@/api/client";

export const getMyCustomerIntelligenceProfile = async (
  userId: string
) => {
  const res = await api.get(
    `/customer-intelligence/profile?userId=${userId}`
  );

  return res.data;
};

export const getMyCustomerIntelligenceActivity = async (
  userId: string
) => {
  const res = await api.get(
    `/customer-intelligence/activity?userId=${userId}`
  );

  return res.data;
};

export const getMyCustomerPreferences = async (
  userId: string
) => {
  const res = await api.get(
    `/customer-intelligence/preferences?userId=${userId}`
  );

  return res.data;
};

export const saveMyCustomerPreference = async (
  userId: string,
  payload: {
    key: string;
    value: string;
    weight?: number;
    source?: string;
  }
) => {
  const res = await api.post(
    "/customer-intelligence/preferences",
    {
      userId,
      ...payload,
    }
  );

  return res.data;
};

export const refreshMyStyleProfile = async (
  userId: string
) => {
  const res = await api.post(
    "/customer-intelligence/style/refresh",
    {
      userId,
    }
  );

  return res.data;
};
