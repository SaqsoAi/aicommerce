import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getPurchaseOrders = async () => {
  const res = await axios.get(`${API}/purchases`);
  return res.data;
};

export const createPurchaseOrder = async (payload: any) => {
  const res = await axios.post(`${API}/purchases`, payload);
  return res.data;
};

export const receivePurchaseOrder = async (
  id: string,
  payload: any
) => {
  const res = await axios.post(`${API}/purchases/${id}/receive`, payload);
  return res.data;
};

export const getGrnList = async () => {
  const res = await axios.get(`${API}/purchases/grn/list`);
  return res.data;
};

export const getSupplierLedger = async () => {
  const res = await axios.get(`${API}/purchases/ledger/list`);
  return res.data;
};
