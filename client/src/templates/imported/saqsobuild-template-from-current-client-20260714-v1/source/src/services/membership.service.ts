import api from "@/api/client";

function getMembershipAuthHeaders() {
  if (typeof window === "undefined") return {};

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("accessToken") ||
    "";

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getMembershipTiers = async () => {
  const res = await api.get("/membership/tiers");
  return res.data;
};

export const getMembershipRecommendation = async (cartAmount: number) => {
  const res = await api.get(`/membership/recommendation?cartAmount=${cartAmount}`);
  return res.data;
};

export const getMembershipCartRecommendation = async (cartAmount: number) => {
  const res = await api.get(`/membership/cart-recommendation?cartAmount=${cartAmount}`);
  return res.data;
};

export const getMembershipQualification = async (cartAmount: number) => {
  const res = await api.get(`/membership/qualification?cartAmount=${cartAmount}`);
  return res.data;
};

export const claimMembershipCard = async (data: { invoiceAmount: number }) => {
  const res = await api.post("/membership/claim", data, {
    headers: getMembershipAuthHeaders(),
  });
  return res.data;
};

export const activateMembershipCard = async (data: {
  cardNumber: string;
  pinCode: string;
}) => {
  const res = await api.post("/membership/activate", data, {
    headers: getMembershipAuthHeaders(),
  });
  return res.data;
};

export const getMyMembership = async () => {
  const res = await api.get("/membership/me", {
    headers: getMembershipAuthHeaders(),
  });
  return res.data;
};

export const calculateMembershipDiscount = async (items: any[]) => {
  try {
    const res = await api.post(
      "/membership/calculate-discount",
      { items },
      { headers: getMembershipAuthHeaders() }
    );

    return res.data;
  } catch {
    return {
      discount: 0,
      totalDiscount: 0,
      membershipDiscount: 0,
      eligible: false,
    };
  }
};

export const getVirtualMembershipCard = async () => {
  const res = await api.get("/membership/virtual-card", {
    headers: getMembershipAuthHeaders(),
  });

  return res.data;
};

export const getMembershipClaims = async () => {
  const res = await api.get("/membership/claims", {
    headers: getMembershipAuthHeaders(),
  });

  return res.data;
};
