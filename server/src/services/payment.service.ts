export const initializePayment = async (
  order: any
) => {
  return {
    success: true,
    transactionId: `TXN-${Date.now()}`,
    gatewayURL: `https://sandbox-payment.local/pay/${order.id}`,
  };
};

export const verifyPayment = async (
  transactionId: string
) => {
  return {
    success: true,
    transactionId,
    status: "PAID",
  };
};

export const refundPayment = async (
  transactionId: string
) => {
  return {
    success: true,
    transactionId,
    status: "REFUNDED",
  };
};