import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getRewardPointRules = async () => {
  const res = await axios.get(`${API}/rewards/point-rules`);
  return res.data.data;
};

export const createRewardPointRule = async (data: any) => {
  const res = await axios.post(`${API}/rewards/point-rules`, data);
  return res.data;
};

export const updateRewardPointRule = async (id: string, data: any) => {
  const res = await axios.put(`${API}/rewards/point-rules/${id}`, data);
  return res.data;
};

export const toggleRewardPointRule = async (id: string) => {
  const res = await axios.patch(`${API}/rewards/point-rules/${id}/toggle`);
  return res.data;
};

export const deleteRewardPointRule = async (id: string) => {
  const res = await axios.delete(`${API}/rewards/point-rules/${id}`);
  return res.data;
};

export const getRewardRedemptionRules = async () => {
  const res = await axios.get(`${API}/rewards/redemption-rules`);
  return res.data.data;
};

export const createRewardRedemptionRule = async (data: any) => {
  const res = await axios.post(`${API}/rewards/redemption-rules`, data);
  return res.data;
};

export const updateRewardRedemptionRule = async (id: string, data: any) => {
  const res = await axios.put(`${API}/rewards/redemption-rules/${id}`, data);
  return res.data;
};

export const toggleRewardRedemptionRule = async (id: string) => {
  const res = await axios.patch(`${API}/rewards/redemption-rules/${id}/toggle`);
  return res.data;
};

export const deleteRewardRedemptionRule = async (id: string) => {
  const res = await axios.delete(`${API}/rewards/redemption-rules/${id}`);
  return res.data;
};

export const getRewardWallets = async () => {
  const res = await axios.get(`${API}/rewards/wallets`);
  return res.data.data;
};

export const getRewardTransactions = async () => {
  const res = await axios.get(`${API}/rewards/transactions`);
  return res.data.data;
};

export const adjustRewardWallet = async (data: any) => {
  const res = await axios.post(`${API}/rewards/wallets/adjust`, data);
  return res.data;
};
