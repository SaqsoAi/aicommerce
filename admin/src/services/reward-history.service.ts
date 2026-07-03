import axios from "axios";

const API =
process.env.NEXT_PUBLIC_API_URL ||
"http://localhost:5000/api";

export const getRewardWalletHistory =
async (userId:string) => {

  const res =
    await axios.get(
      `${API}/rewards/wallet-history/${userId}`
    );

  return res.data.data;
};
