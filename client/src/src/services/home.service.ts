import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getFeaturedProducts =
  async () => {
    const response =
      await axios.get(
        `${API}/products/featured`
      );

    return response.data;
  };

export const getTrendingProducts =
  async () => {
    const response =
      await axios.get(
        `${API}/products/trending`
      );

    return response.data;
  };

export const getCategories =
  async () => {
    const response =
      await axios.get(
        `${API}/categories`
      );

    return response.data;
  };