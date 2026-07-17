import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getProductById =
  async (id: string) => {
    const response =
      await axios.get(
        `${API_URL}/products/${id}`
      );

    return response.data;
  };
