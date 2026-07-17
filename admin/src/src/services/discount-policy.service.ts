import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getDiscountPolicy = async () => {
  const res = await axios.get(`${API}/discount-policy`);
  return res.data;
};

export const updateDiscountPolicy = async (payload: any) => {
  const res = await axios.put(`${API}/discount-policy`, payload);
  return res.data;
};
