import { ZodError } from "zod";
import { Request, Response } from "express";

import prisma from "../config/prisma";

import { applyB1G1, packageDiscount } from "../ai/offer.engine";

import { createShipment } from "../ai/courier.engine";

// Ã¢Å“â€¦ EMAIL SERVICE
import { sendOrderEmail } from "../services/email.service";

// Ã°Å¸Å¡â‚¬ PAYMENT SERVICE
import { initializePayment } from "../services/payment.service";

import { orderSchema } from "../validators/order.validator";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const validated = orderSchema.parse(req.body);

    const subtotal = validated.items.reduce(
      (
        sum: number,
        item: {
          price: number;
          quantity: number;
        },
      ) => sum + item.price * item.quantity,
      0,
    );

    const deliveryCharge = 100;

    const finalAmount = subtotal + deliveryCharge;

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,

        totalAmount: subtotal,

        finalAmount,

        deliveryCharge,

        paymentMethod: validated.paymentMethod,

        customerName: validated.customer.name,

        customerPhone: validated.customer.phone,

        customerAddress: validated.customer.address,

        userId: validated.userId,

        items: {
          create: validated.items.map(
            (item: { productId: string; quantity: number; price: number }) => ({
              productId: item.productId,

              quantity: item.quantity,

              price: item.price,
            }),
          ),
        },
      },

      include: {
        items: true,
      },
    });

    // Ã°Å¸Å¡â‚¬ PAYMENT INITIATION (ADDED)
    const payment = validated.paymentMethod === "COD" ? null : await initializePayment(order);

    if (payment?.gatewayURL) console.log("Payment Gateway:", payment.gatewayURL);

    // Ã¢Å“â€¦ SEND EMAIL
    await sendOrderEmail(validated.customer.phone);

    // Ã°Å¸Å¡Å¡ CREATE SHIPMENT
    const shipment = await createShipment(order);
    console.log(shipment);

    // CUSTOMER PROFILE AUTO SYNC
    await prisma.user.update({
      where: {
        id: validated.userId,
      },
      data: {
        name: validated.customer.name,
        phone: validated.customer.phone,
        addressLine1: validated.customer.address,
      },
    });

    // Ã°Å¸Â§Â  ADD STOCK REDUCTION LOGIC
    for (const item of validated.items) {
      const variant = await prisma.productVariant.findFirst({
        where: {
          productId: item.productId,
        },
      });

      if (!variant) continue;

      if (variant.stock < item.quantity) {
        throw new Error("Out of stock");
      }

      await prisma.productVariant.update({
        where: {
          id: variant.id,
        },

        data: {
          stock: {
            decrement: item.quantity,
          },

          availableStock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Ã¢Å“â€¦ FINAL RESPONSE
    res.status(201).json({
      order,
      shipment,
      payment, // Ã°Å¸Å¡â‚¬ ADDED HERE
    });
  } catch (error: any) {
    console.log(error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Order validation failed",
        details: error.issues,
      });
    }

    res.status(500).json({
      message: error?.message || "Order creation failed",
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const rawUserId = req.params.userId;

    let orders;

    if (typeof rawUserId === "string") {
      orders = await prisma.order.findMany({
        where: {
          userId: rawUserId,
        },

        include: {
          items: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      orders = await prisma.order.findMany({
        include: {
          items: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: String(req.params.id),
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const getOrderTimeline = async (req: Request, res: Response) => {
  try {
    const timeline = await prisma.orderTimeline.findMany({
      where: {
        orderId: String(req.params.id),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch timeline",
    });
  }
};

export const addOrderNote = async (req: Request, res: Response) => {
  try {
    const note = await prisma.orderNote.create({
      data: {
        orderId: String(req.params.id),
        note: String(req.body.note),
        createdBy: req.body.createdBy || "ADMIN",
      },
    });

    return res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        status: req.body.status,
      },
    });

    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: req.body.status,
        message: req.body.message || `Order moved to ${req.body.status}`,
      },
    });

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
};

export const getOrderTracking = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        trackingCode: order.trackingCode,
        courier: order.courierName,
        shipmentStatus: order.shipmentStatus,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tracking",
    });
  }
};

export const getOrderAnalytics = async (req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();

    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING",
      },
    });

    const deliveredOrders = await prisma.order.count({
      where: {
        status: "DELIVERED",
      },
    });

    const cancelledOrders = await prisma.order.count({
      where: {
        status: "CANCELLED",
      },
    });

    const revenue = await prisma.order.aggregate({
      _sum: {
        finalAmount: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: revenue._sum.finalAmount ?? 0,
      },
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};







