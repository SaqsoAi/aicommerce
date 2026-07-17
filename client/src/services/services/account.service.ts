import api from "@/lib/api";

const getToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

export const getProfile = async () => {
  try {
    if (!getToken()) return null;

    const res = await api.get("/account/profile");
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return null;
    throw error;
  }
};

export const updateProfile = async (payload: any) => {
  try {
    if (!getToken()) return null;

    const res = await api.put("/account/profile", payload);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return null;
    throw error;
  }
};

export const getCustomerProfileFields = async () => {
  try {
    const res = await api.get("/customer-profile-fields");
    return res.data?.data ?? res.data ?? [];
  } catch (error: any) {
    if (error?.response?.status === 401) return [];
    if (error?.response?.status === 404) return [];
    return [];
  }
};
