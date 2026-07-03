
function sanitizeOrderPayload(payload: any) {
  let storedUser: any = null;

  if (typeof window !== "undefined") {
    try {
      storedUser =
        JSON.parse(localStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("customer") || "null") ||
        JSON.parse(localStorage.getItem("authUser") || "null");
    } catch {}
  }

  const userId =
    payload?.userId ||
    storedUser?.id ||
    storedUser?._id ||
    "guest-checkout-user";

  const customer = payload?.customer || {};
  const phone =
    customer?.phone ||
    payload?.phone ||
    payload?.mobile ||
    payload?.contactPhone ||
    storedUser?.phone ||
    storedUser?.mobile ||
    "01700000000";

  return {
    ...payload,
    userId: String(userId),
    customer: {
      ...customer,
      phone: String(phone),
    },
  };
}
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getMyOrders = async (
  userId: string
) => {
  const response =
    await axios.get(
      `${API_URL}/orders/user/${userId}`
    );

  return response.data;
};

export const getOrderById = async (
  id: string
) => {
  const response =
    await axios.get(
      `${API_URL}/orders/${id}`
    );

  return response.data;
};

export const getOrderTimeline = async (
  orderId: string
) => {
  const response =
    await axios.get(
      `${API_URL}/order-engine/${orderId}/timeline`
    );

  return response.data;
};

export const getOrderInvoice = async (
  orderId: string
) => {
  const response =
    await axios.get(
      `${API_URL}/order-engine/${orderId}/invoice`
    );

  return response.data;
};

export const requestReturn = async (
  orderId: string,
  payload: {
    reason: string;
    description?: string;
    userId?: string;
  }
) => {
  const response =
    await axios.post(
      `${API_URL}/order-engine/${orderId}/return`,
      payload
    );

  return response.data;
};

export const requestRefund = async (
  orderId: string,
  payload: {
    amount: number;
    reason?: string;
    userId?: string;
  }
) => {
  const response =
    await axios.post(
      `${API_URL}/order-engine/${orderId}/refund`,
      payload
    );

  return response.data;
};

export const createOrder = async (
  payload: any
) => {
  try {
    const response =
      await axios.post(
        `${API_URL}/orders`,
        sanitizeOrderPayload(payload)
      );

    return response.data;
  } catch (error: any) {
    console.error("Create order failed:", {
      status: error?.response?.status,
      data: error?.response?.data,
      payload,
      error,
    });
    throw new Error(
      error?.response?.data?.details || error?.response?.data?.error || error?.response?.data?.message || error?.message || "Order failed"
    );
  }
};

export const getOrderTracking = async (
  orderId: string
) => {

  const response =
    await axios.get(
      `${API_URL}/order-engine/${orderId}/timeline`
    );

  return response.data;
};






