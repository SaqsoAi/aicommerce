export function getCustomerToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export function saveCustomerSession(payload: any) {
  const token =
    payload?.token ||
    payload?.accessToken ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    "";

  const user =
    payload?.user ||
    payload?.data?.user ||
    payload?.customer ||
    payload?.data?.customer ||
    null;

  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("customerToken", token);
    localStorage.setItem("accessToken", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("customer", JSON.stringify(user));
    if (user.role) localStorage.setItem("role", user.role);
  }

  return token;
}

export function logoutCustomer() {
  localStorage.removeItem("token");
  localStorage.removeItem("customerToken");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("customer");
  localStorage.removeItem("role");
}
