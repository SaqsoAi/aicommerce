import api from "./client";

// 🧠 STEP 233 — CREATE ORDER (CHECKOUT FLOW)
export const createOrder = async (data: {
  items: any[];
  paymentMethod: string;
  address: string;
}) => {
  const res = await api.post("/orders", data);
  return res.data;
};

// 📦 GET ALL ORDERS
export const getOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};