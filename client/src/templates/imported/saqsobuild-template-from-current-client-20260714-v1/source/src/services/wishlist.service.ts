import api from "@/api/client";

export const addToWishlist =
  async (
    userId: string,
    productId: string
  ) => {
    const res =
      await api.post(
        "/wishlist",
        {
          userId,
          productId,
        }
      );

    return res.data;
  };

export const getWishlist =
  async (
    userId: string
  ) => {
    const res =
      await api.get(
        `/wishlist/${userId}`
      );

    return res.data;
  };

export const removeWishlist =
  async (
    id: string
  ) => {
    const res =
      await api.delete(
        `/wishlist/${id}`
      );

    return res.data;
  };