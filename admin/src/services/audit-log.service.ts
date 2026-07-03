import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getAuditLogs =
  async () => {
    const res =
      await axios.get(
        `${API}/audit-logs`
      );

    return res.data;
  };
