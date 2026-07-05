import { Request, Response } from "express";
import {
  createRefundRequest,
  getRefundRequests,
  getUserRefundRequests,
  updateRefundStatus,
} from "./refund.service";

function getAuthUser(req: Request): any {
  return (req as any).user || (req as any).authUser || {};
}

export async function createRefundRequestController(req: Request, res: Response) {
  try {
    const user = getAuthUser(req);
    const result = await createRefundRequest({
      orderId: String(req.body.orderId || ""),
      userId: String(req.body.userId || user.id || user.userId || ""),
      amount: Number(req.body.amount),
      reason: String(req.body.reason || ""),
      actorId: user.role && user.role !== "CUSTOMER" ? String(user.id || user.userId || "") : null,
      provider: req.body.provider ? String(req.body.provider) : "manual",
      notes: req.body.notes ? String(req.body.notes) : null,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create refund request" });
  }
}

export async function updateRefundStatusController(req: Request, res: Response) {
  try {
    const user = getAuthUser(req);
    const result = await updateRefundStatus({
      refundId: String(req.params.id || ""),
      status: String(req.body.status || ""),
      actorId: String(user.id || user.userId || "system"),
      providerRefundId: req.body.providerRefundId ? String(req.body.providerRefundId) : null,
      notes: req.body.notes ? String(req.body.notes) : null,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update refund" });
  }
}

export async function getRefundRequestsController(_req: Request, res: Response) {
  try {
    const result = await getRefundRequests();
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch refunds" });
  }
}

export async function getMyRefundRequestsController(req: Request, res: Response) {
  try {
    const user = getAuthUser(req);
    const result = await getUserRefundRequests(String(user.id || user.userId || ""));
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch my refunds" });
  }
}
