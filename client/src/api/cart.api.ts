import api from "./client";

// 🧠 STEP 231 — ADD TO CART
export const addToCart = async (productId: string, quantity: number) => {
  const res = await api.post("/cart", {
    productId,
    quantity,
  });

  return res.data;
};

// 🧠 STEP 232 — FETCH CART
export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};