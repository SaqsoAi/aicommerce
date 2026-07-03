const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getCustomerIntelligenceProfile = async (
  userId: string
) => {
  const res = await fetch(
    `${API}/customer-intelligence/profile?userId=${userId}`
  );

  return res.json();
};

export const getCustomerIntelligenceActivity = async (
  userId: string
) => {
  const res = await fetch(
    `${API}/customer-intelligence/activity?userId=${userId}`
  );

  return res.json();
};

export const getCustomerIntelligencePreferences = async (
  userId: string
) => {
  const res = await fetch(
    `${API}/customer-intelligence/preferences?userId=${userId}`
  );

  return res.json();
};
