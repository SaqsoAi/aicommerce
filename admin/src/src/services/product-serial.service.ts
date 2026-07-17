import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getNextProductSerials = async () => {
  const res = await axios.get(`${API}/product-serial/next`);
  return res.data?.data || res.data;
};
