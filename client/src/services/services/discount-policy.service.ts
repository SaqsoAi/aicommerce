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

export const getDiscountPolicy = async () => {
  const token = getToken();

  const res = await fetch(`${API}/discount-policy`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      active: false,
      rules: [],
      discount: 0,
    };
  }

  return res.json();
};


