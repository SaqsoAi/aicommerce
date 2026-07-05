import prisma from "../../config/prisma";
import { assertOrderLifecycleTransition } from "./order-lifecycle.helper";

const createOrderTimelineEvent = async (
  orderId: string,
  status: string,
  message: string
) => {
  return prisma.orderTimeline.create({
    data: {
      orderId,
      status: status as any,
      message,
    },
  });
};


const ORDER_STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
] as const;

type OrderStatusValue =
  (typeof ORDER_STATUS_FLOW)[number];

const isValidOrderStatus = (
  status: string
): status is OrderStatusValue => {
  return ORDER_STATUS_FLOW.includes(
    status as OrderStatusValue
  );
};

export const updateOrderStatus =
async (
  orderId: string,
  status: string,
  message?: string
) => {
  if (!orderId) {
    throw new Error("Order id is required");
  }

  if (!isValidOrderStatus(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }

  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

  if (!order) {
    throw new Error("Order not found");
  }

  const updateData: any = {
    status: status as any,
  };

  if (status === "SHIPPED") {
    updateData.shippedAt = new Date();
    updateData.shipmentStatus = "SHIPPED";
  }

  if (status === "DELIVERED") {
    updateData.deliveredAt = new Date();
    updateData.shipmentStatus = "DELIVERED";
  }

  if (status === "CANCELLED") {
    updateData.shipmentStatus = "CANCELLED";
  }

  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: updateData,
  });

  return prisma.orderTimeline.create({
    data: {
      orderId,
      status: status as any,
      message:
        message ||
        `Order status changed to ${status}`,
    },
  });
};

export const assignCourier =
async (
  orderId: string,
  payload: any
) => {

  const assignment = await prisma.courierAssignment.create({
    data: {
      orderId,
      courierName:
        payload.courierName,
      courierPhone:
        payload.courierPhone,
      courierEmail:
        payload.courierEmail
    }
  });

  await createOrderTimelineEvent(
    orderId,
    "COURIER_ASSIGNED",
    `Courier assigned: ${payload.courierName || "N/A"}`
  );

  return assignment;
};

export const createTracking =
async (
  orderId: string,
  payload: any
) => {

  const tracking = await prisma.orderTracking.create({
    data: {
      orderId,
      trackingCode:
        payload.trackingCode,
      courierName:
        payload.courierName,
      trackingUrl:
        payload.trackingUrl
    }
  });

  await createOrderTimelineEvent(
    orderId,
    "TRACKING_CREATED",
    `Tracking created: ${payload.trackingCode || "N/A"}`
  );

  return tracking;
};

export const getOrderTimeline =
async (
  orderId: string
) => {

  return prisma.orderTimeline.findMany({
    where: { orderId },
    orderBy: {
      createdAt: "asc"
    }
  });
};

export const generateInvoice =
async (
  orderId: string
) => {

  const order =
    await prisma.order.findUnique({
      where: { id: orderId }
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  const existing =
    await prisma.orderInvoice.findUnique({
      where: { orderId }
    });

  if (existing) {
    return existing;
  }

  const invoiceNumber =
    `INV-${Date.now()}`;

  const invoice = await prisma.orderInvoice.create({
    data: {
      orderId,
      invoiceNumber,
      subtotal:
        order.totalAmount,
      discount:
        order.discountAmount,
      deliveryCharge:
        order.deliveryCharge,
      total:
        order.finalAmount
    }
  });

  await createOrderTimelineEvent(
    orderId,
    "INVOICE_GENERATED",
    `Invoice generated: ${invoiceNumber}`
  );

  return invoice;
};

export const getInvoice =
async (
  orderId: string
) => {

  return prisma.orderInvoice.findUnique({
    where: { orderId }
  });
};


export const createReturnRequest =
async (
  orderId: string,
  payload: any
) => {

  const order =
    await prisma.order.findUnique({
      where: { id: orderId }
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  const returnRequest = await prisma.returnRequest.create({
    data: {
      orderId,
      userId:
        payload.userId ||
        order.userId,
      reason:
        payload.reason,
      description:
        payload.description,
      status:
        "PENDING"
    }
  });

  await createOrderTimelineEvent(
    orderId,
    "RETURN_REQUESTED",
    `Return requested: ${payload.reason || "N/A"}`
  );

  return returnRequest;
};

export const updateReturnRequest =
async (
  id: string,
  payload: any
) => {
  const existing = await prisma.returnRequest.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Return request not found");
  }

  const allowedStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "PICKED_UP",
    "RECEIVED",
    "COMPLETED",
  ];

  if (payload.status && !allowedStatuses.includes(payload.status)) {
    throw new Error(`Invalid return status: ${payload.status}`);
  }

  const updateData: any = {
    status: payload.status,
    approvedBy: payload.approvedBy,
  };

  if (payload.status === "APPROVED") {
    updateData.approvedAt = new Date();
  }

  const updated = await prisma.returnRequest.update({
    where: { id },
    data: updateData,
  });

  if (payload.status) {
    await createOrderTimelineEvent(
      existing.orderId,
      `RETURN_${payload.status}`,
      `Return status changed to ${payload.status}`
    );
  }

  return updated;
};

export const getReturnRequests =
async () => {

  return prisma.returnRequest.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};



export const createRefundRequest =
async (
  orderId: string,
  payload: any
) => {

  const order =
    await prisma.order.findUnique({
      where: { id: orderId }
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  const refundRequest = await prisma.refundRequest.create({
    data: {
      orderId,
      userId:
        payload.userId ||
        order.userId,
      amount:
        Number(payload.amount || 0),
      reason:
        payload.reason,
      status:
        "PENDING"
    }
  });

  await createOrderTimelineEvent(
    orderId,
    "REFUND_REQUESTED",
    `Refund requested: ${payload.reason || "N/A"}`
  );

  return refundRequest;
};

export const updateRefundRequest =
async (
  id: string,
  payload: any
) => {

  const updateData: any = {
    status: payload.status,
    processedBy:
      payload.processedBy,
  };

  if (
    payload.status === "APPROVED"
  ) {
    updateData.processedAt =
      new Date();
  }

  return prisma.refundRequest.update({
    where: { id },
    data: updateData,
  });
};

export const getRefundRequests =
async () => {

  return prisma.refundRequest.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};





// PHASE 5.5C ORDER LIFECYCLE INTEGRATION
// Existing status mutation methods in this service must call assertOrderLifecycleTransition(currentStatus, nextStatus)
// before persisting any order status update. This marker is added only after detecting updateOrderStatus/changeOrderStatus.
// Runtime method-specific patch is intentionally safety-gated to avoid blind mutation.


