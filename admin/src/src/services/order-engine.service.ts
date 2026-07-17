const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const request = async (
  path: string,
  options: RequestInit = {}
) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok || data?.success === false) {
    throw new Error(
      data?.message ||
        `Request failed with status ${res.status}`
    );
  }

  return data;
};

export const getOrders = async () => {
  return request("/orders");
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  message?: string
) => {
  return request(`/order-engine/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      message,
    }),
  });
};

export const assignCourier = async (
  orderId: string,
  payload: any
) => {
  return request(`/order-engine/${orderId}/courier`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const createTracking = async (
  orderId: string,
  payload: any
) => {
  return request(`/order-engine/${orderId}/tracking`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getOrderTimeline = async (
  orderId: string
) => {
  return request(`/order-engine/${orderId}/timeline`);
};

export const generateInvoice = async (
  orderId: string
) => {
  return request(`/order-engine/${orderId}/invoice`, {
    method: "POST",
  });
};

export const getInvoice = async (
  orderId: string
) => {
  return request(`/order-engine/${orderId}/invoice`);
};

export const getReturns = async () => {
  return request("/order-engine/returns/list");
};

export const createReturnRequest = async (
  orderId: string,
  payload: any
) => {
  return request(`/order-engine/${orderId}/return`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateReturn = async (
  id: string,
  payload: any
) => {
  return request(`/order-engine/return/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const getRefunds = async () => {
  return request("/order-engine/refunds/list");
};

export const createRefundRequest = async (
  orderId: string,
  payload: any
) => {
  return request(`/order-engine/${orderId}/refund`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateRefund = async (
  id: string,
  payload: any
) => {
  return request(`/order-engine/refund/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};
