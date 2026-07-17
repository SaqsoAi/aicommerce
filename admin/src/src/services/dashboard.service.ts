import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getDashboardSummary =
  async () => {
    const response =
      await axios.get(
        `${API}/dashboard/summary`
      );

    return response.data;
  };