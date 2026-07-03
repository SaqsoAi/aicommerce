const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const getToken = () => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

const headers = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function safeJson(res: Response, fallback: any) {
  if (!res.ok) return fallback;
  try {
    return await res.json();
  } catch {
    return fallback;
  }
}

export const getRewardWallet = async () => {
  const res = await fetch(`${API}/rewards/wallet`, {
    headers: headers(),
    cache: "no-store",
  });

  return safeJson(res, {
    balance: 0,
    points: 0,
    transactions: [],
  });
};

export const getRewardRedemptionRules = async () => {
  const res = await fetch(`${API}/rewards/redemption-rules`, {
    headers: headers(),
    cache: "no-store",
  });

  return safeJson(res, []);
};

export const redeemReward = async (ruleId: string) => {
  const res = await fetch(`${API}/rewards/redeem`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ruleId }),
  });

  return safeJson(res, null);
};

export const getRewardHistory = async (userId: string) => {
  const res = await fetch(`${API}/rewards/wallet-history/${userId}`, {
    headers: headers(),
    cache: "no-store",
  });

  return safeJson(res, []);
};


