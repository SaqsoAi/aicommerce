import axios from "axios";

const API =
process.env.NEXT_PUBLIC_API_URL ||
"http://localhost:5000/api";

export const getMembershipClaims =
async () => {

  const res =
    await axios.get(
      `${API}/membership/claims`
    );

  return res.data.data;
};

export const getMembershipCards =
async () => {

  const res =
    await axios.get(
      `${API}/membership/cards`
    );

  return res.data.data;
};

export const issueMembershipCard =
async (
  claimId:string,
  whatsapp?:string
) => {

  const res =
    await axios.post(
      `${API}/membership/claims/${claimId}/issue-card`,
      { whatsapp }
    );

  return res.data;
};
