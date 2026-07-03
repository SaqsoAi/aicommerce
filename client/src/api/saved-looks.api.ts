import api from "@/lib/api";

const getToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

export const getMySavedLooks = async () => {
  try {
    if (!getToken()) return [];

    const res = await api.get("/saved-looks/me");
    return res.data.data ?? [];
  } catch (error: any) {
    if (error?.response?.status === 401) return [];
    throw error;
  }
};

export const removeSavedLook = async (id: string) => {
  try {
    if (!getToken()) return null;

    const res = await api.delete(`/saved-looks/${id}`);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return null;
    throw error;
  }
};
