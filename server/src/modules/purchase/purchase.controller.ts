import { Request, Response } from "express";

import {
  createPurchaseOrderService,
  getGoodsReceiveNotesService,
  getPurchaseOrdersService,
  getSupplierLedgerService,
  receivePurchaseOrderService,
} from "./purchase.service";

import { purchaseSchema } from "./purchase.validation";

export const createPurchaseOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const data = purchaseSchema.parse(req.body);
    const order = await createPurchaseOrderService(data);

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPurchaseOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const orders = await getPurchaseOrdersService();

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const receivePurchaseOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await receivePurchaseOrderService(
      String(req.params.id),
      req.body
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGoodsReceiveNotes = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getGoodsReceiveNotesService();

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

export const getSupplierLedger = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getSupplierLedgerService();

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
