import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const generateAIContent = async (name: string) => {
  const productName = name || "Product";

  const res = await axios.post(
    `${API}/ai-content/product-description`,
    {
      name: productName,
      productName,
    }
  );

  return res.data?.data || res.data;
};
