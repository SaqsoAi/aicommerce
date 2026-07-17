import axios from "axios";

const API =
process.env.NEXT_PUBLIC_API_URL ||
"http://localhost:5000/api";

export const getMembershipBenefits =
async () => {
  const res =
    await axios.get(
      `${API}/membership-benefits`
    );

  return res.data.data;
};

export const createMembershipBenefit =
async (payload:any) => {

  const res =
    await axios.post(
      `${API}/membership-benefits`,
      payload
    );

  return res.data;
};
