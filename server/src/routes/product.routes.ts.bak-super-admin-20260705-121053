import express from "express";
import prisma from "../config/prisma";

import { protect } from "../modules/auth/auth.middleware";
import { permission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

import {
  getProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  duplicateProduct,
} from "../controllers/product.controller";

import { uploadMedia } from "../controllers/upload.controller";

import upload from "../middleware/upload.middleware";
import { quotaGuard } from "../modules/saas-foundation/quota.guard";

const router = express.Router();

router.get("/", getProducts);

router.get("/featured", getFeaturedProducts);

router.get("/trending", getTrendingProducts);

router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  permission(PERMISSIONS.PRODUCT_CREATE),
  quotaGuard("products"),
  createProduct
);

router.put(
  "/:id",
  protect,
  permission(PERMISSIONS.PRODUCT_UPDATE),
  updateProduct
);

router.patch(
  "/:id/status",
  protect,
  permission(PERMISSIONS.PRODUCT_UPDATE),
  updateProductStatus
);

router.post(
  "/:id/submit-review",
  protect,
  permission(PERMISSIONS.PRODUCT_UPDATE),
  async (req, res) => {
    try {
      const id = String(req.params.id || "");
      const actorId = String((req as any).user?.id || "");
      const note = typeof req.body?.note === "string" ? req.body.note.trim() : null;

      const product = await prisma.product.findUnique({
        where: { id },
        select: { id: true, approvalStatus: true, status: true },
      });

      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      const updated = await prisma.$transaction(async (tx: any) => {
        const next = await tx.product.update({
          where: { id },
          data: {
            approvalStatus: "REVIEW",
            approvalNote: note,
            submittedForReviewAt: new Date(),
            status: "DRAFT",
          },
        });

        await tx.productApproval.create({
          data: {
            productId: id,
            action: "SUBMIT_REVIEW",
            fromStatus: product.approvalStatus || product.status || "DRAFT",
            toStatus: "REVIEW",
            note,
            actorId,
          },
        });

        return next;
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Submit review failed" });
    }
  }
);

router.post(
  "/:id/approve",
  protect,
  permission(PERMISSIONS.PRODUCT_UPDATE),
  async (req, res) => {
    try {
      const id = String(req.params.id || "");
      const actorId = String((req as any).user?.id || "");
      const note = typeof req.body?.note === "string" ? req.body.note.trim() : null;

      const product = await prisma.product.findUnique({
        where: { id },
        select: { id: true, approvalStatus: true, status: true },
      });

      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      const updated = await prisma.$transaction(async (tx: any) => {
        const next = await tx.product.update({
          where: { id },
          data: {
            approvalStatus: "APPROVED",
            approvalNote: note,
            approvedBy: actorId || null,
            approvedAt: new Date(),
            status: "ACTIVE",
            visibility: "PUBLIC",
          },
        });

        await tx.productApproval.create({
          data: {
            productId: id,
            action: "APPROVE",
            fromStatus: product.approvalStatus || product.status || "DRAFT",
            toStatus: "APPROVED",
            note,
            actorId,
          },
        });

        return next;
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Approve product failed" });
    }
  }
);

router.post(
  "/:id/reject",
  protect,
  permission(PERMISSIONS.PRODUCT_UPDATE),
  async (req, res) => {
    try {
      const id = String(req.params.id || "");
      const actorId = String((req as any).user?.id || "");
      const note = typeof req.body?.note === "string" ? req.body.note.trim() : null;

      const product = await prisma.product.findUnique({
        where: { id },
        select: { id: true, approvalStatus: true, status: true },
      });

      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      const updated = await prisma.$transaction(async (tx: any) => {
        const next = await tx.product.update({
          where: { id },
          data: { approvalStatus: "REJECTED", approvalNote: note, status: "DRAFT" },
        });

        await tx.productApproval.create({
          data: {
            productId: id,
            action: "REJECT",
            fromStatus: product.approvalStatus || product.status || "DRAFT",
            toStatus: "REJECTED",
            note,
            actorId,
          },
        });

        return next;
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Reject product failed" });
    }
  }
);

router.post(
  "/:id/schedule",
  protect,
  permission(PERMISSIONS.PRODUCT_UPDATE),
  async (req, res) => {
    try {
      const id = String(req.params.id || "");
      const actorId = String((req as any).user?.id || "");
      const publishAt = typeof req.body?.publishAt === "string" && req.body.publishAt ? new Date(req.body.publishAt) : null;
      const unpublishAt = typeof req.body?.unpublishAt === "string" && req.body.unpublishAt ? new Date(req.body.unpublishAt) : null;

      if (publishAt && Number.isNaN(publishAt.getTime())) return res.status(400).json({ success: false, message: "Invalid publishAt" });
      if (unpublishAt && Number.isNaN(unpublishAt.getTime())) return res.status(400).json({ success: false, message: "Invalid unpublishAt" });

      const product = await prisma.product.findUnique({
        where: { id },
        select: { id: true, approvalStatus: true, status: true },
      });

      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      if (product.approvalStatus !== "APPROVED") return res.status(400).json({ success: false, message: "Only approved products can be scheduled" });

      const updated = await prisma.$transaction(async (tx: any) => {
        const next = await tx.product.update({
          where: { id },
          data: { publishAt, unpublishAt, status: "ACTIVE", visibility: "PUBLIC" },
        });

        await tx.productApproval.create({
          data: {
            productId: id,
            action: "SCHEDULE",
            fromStatus: product.approvalStatus || product.status || "APPROVED",
            toStatus: "SCHEDULED",
            note: "Publish: " + (publishAt ? publishAt.toISOString() : "now") + "; Unpublish: " + (unpublishAt ? unpublishAt.toISOString() : "none"),
            actorId,
          },
        });

        return next;
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Schedule product failed" });
    }
  }
);

router.post(
  "/:id/duplicate",
  protect,
  permission(PERMISSIONS.PRODUCT_CREATE),
  quotaGuard("products"),
  duplicateProduct
);

router.post(
  "/upload",
  protect,
  permission(PERMISSIONS.MEDIA_UPLOAD),
  upload.single("file"),
  uploadMedia
);

router.delete(
  "/:id",
  protect,
  permission(PERMISSIONS.PRODUCT_DELETE),
  async (req, res) => {
    try {
      const id = String(req.params.id || "");

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Product id is required",
        });
      }

      const orderItems = await prisma.orderItem.findFirst({
        where: { productId: id },
      });

      if (orderItems) {
        return res.status(400).json({
          success: false,
          message: "Product cannot be deleted because it has order history",
        });
      }

      await prisma.$transaction(async (tx: any) => {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        await tx.wishlist.deleteMany({
          where: { productId: id },
        });

        await tx.cart.deleteMany({
          where: { productId: id },
        });

        await tx.product.delete({
          where: { id },
        });
      });

      return res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Product delete failed",
      });
    }
  }
);

export default router;

