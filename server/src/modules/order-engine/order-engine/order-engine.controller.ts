import { Request, Response } from "express";

import {
  updateOrderStatus,
  assignCourier,
  createTracking,
  getOrderTimeline,
  generateInvoice,
  getInvoice,
  createReturnRequest,
  updateReturnRequest,
  getReturnRequests,
  createRefundRequest,
  updateRefundRequest,
  getRefundRequests,
} from "./order-engine.service";

export const updateOrderStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const orderId = req.params.orderId as string;

    const { status, message } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "orderId and status are required",
      });
    }

    const data = await updateOrderStatus(orderId, status, message);

    return res.json({
      success: true,
      message: "Order status updated",
      data,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Order status update failed",
    });
  }
};

export const assignCourierController = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;

    if (!orderId || !req.body.courierName) {
      return res.status(400).json({
        success: false,
        message: "orderId and courierName are required",
      });
    }

    const data = await assignCourier(orderId, req.body);

    return res.json({
      success: true,
      message: "Courier assigned",
      data,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Courier assignment failed",
    });
  }
};

export const createTrackingController = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;

    if (!orderId || !req.body.trackingCode || !req.body.courierName) {
      return res.status(400).json({
        success: false,
        message: "orderId, trackingCode and courierName are required",
      });
    }

    const data = await createTracking(orderId, req.body);

    return res.json({
      success: true,
      message: "Tracking created",
      data,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Tracking creation failed",
    });
  }
};

export const getOrderTimelineController = async (
  req: Request,
  res: Response,
) => {
  try {
    const orderId = req.params.orderId as string;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const data = await getOrderTimeline(orderId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Timeline fetch failed",
    });
  }
};

export const generateInvoiceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const orderId = String(req.params.orderId ?? "");

    const data = await generateInvoice(orderId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInvoiceController = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId ?? "");

    const data = await getInvoice(orderId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createReturnRequestController =
async (
  req: Request,
  res: Response
) => {

  try {

    const orderId =
      String(req.params.orderId || "");

    if (!orderId || !req.body.reason) {
      return res.status(400).json({
        success: false,
        message:
          "orderId and reason are required"
      });
    }

    const data =
      await createReturnRequest(
        orderId,
        req.body
      );

    return res.json({
      success: true,
      data
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};

export const updateReturnRequestController =
async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      String(req.params.id || "");

    if (!id || !req.body.status) {
      return res.status(400).json({
        success: false,
        message:
          "id and status are required"
      });
    }

    const data =
      await updateReturnRequest(
        id,
        req.body
      );

    return res.json({
      success: true,
      data
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};

export const getReturnRequestsController =
async (
  _req: Request,
  res: Response
) => {

  try {

    const data =
      await getReturnRequests();

    return res.json({
      success: true,
      data
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};



export const createRefundRequestController =
async (
  req: Request,
  res: Response
) => {

  try {

    const orderId =
      String(req.params.orderId || "");

    if (
      !orderId ||
      !req.body.amount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "orderId and amount are required"
      });
    }

    const data =
      await createRefundRequest(
        orderId,
        req.body
      );

    return res.json({
      success: true,
      data
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};

export const updateRefundRequestController =
async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      String(req.params.id || "");

    if (
      !id ||
      !req.body.status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "id and status are required"
      });
    }

    const data =
      await updateRefundRequest(
        id,
        req.body
      );

    return res.json({
      success: true,
      data
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};

export const getRefundRequestsController =
async (
  _req: Request,
  res: Response
) => {

  try {

    const data =
      await getRefundRequests();

    return res.json({
      success: true,
      data
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};


