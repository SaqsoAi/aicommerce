import api from "./client";

export const createVirtualTryOn = async (
  payload: {
    userId: string;
    productId: string;
    personImage: string;
  }
) => {
  const res = await api.post(
    "/virtual-tryon/create",
    payload
  );

  return res.data;
};

export const getVirtualTryOnHistory = async () => {
  const res = await api.get(
    "/virtual-tryon/history"
  );

  return res.data;
};

export const getMyVirtualTryOnHistory = async () => {
  try {
    const res = await api.get(
      "/virtual-tryon/history/me"
    );

    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return {
        success: true,
        data: [],
        fallback: true,
      };
    }

    throw error;
  }
};

export const retryVirtualTryOn = async (id: string) => {
  const res = await api.post(
    `/virtual-tryon/history/${id}/retry`
  );

  return res.data;
};

export const deleteVirtualTryOnHistory = async (id: string) => {
  const res = await api.delete(
    `/virtual-tryon/history/${id}`
  );

  return res.data;
};
