import axios from "axios";

const API =
process.env.NEXT_PUBLIC_API_URL ||
"http://localhost:5000/api";

export const getMembershipSettings =
async () => {

  const res =
    await axios.get(
      `${API}/membership/settings`
    );

  return res.data.data;
};

export const updateMembershipSettings =
async (payload:any) => {

  const res =
    await axios.put(
      `${API}/membership/settings`,
      payload
    );

  return res.data;
};
