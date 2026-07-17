import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const globalSearch =
  async (
    query: string
  ) => {
    const res =
      await axios.get(
        `${API}/search?q=${query}`
      );

    return res.data;
  };