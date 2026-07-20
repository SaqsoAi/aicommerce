import type { Response } from "express";
import type { AuthRequest } from "../auth/auth.middleware";
import {
  createTemplateCertification,
  getLatestTemplateCertification,
  listTemplateCertifications,
  revokeTemplateCertification,
} from "./template-lifecycle.service";

function errorResponse(error: any, res: Response) {
  return res.status(Number(error?.statusCode || 500)).json({
    success: false,
    code: error?.code || "TEMPLATE_CERTIFICATION_ERROR",
    message: error?.message || "Template certification request failed.",
  });
}

export async function certifyTemplate(
  req: AuthRequest,
  res: Response,
) {
  try {
    const certification = await createTemplateCertification(
      {
        templateSlug: String(req.params.slug || "").trim(),
        storeId: req.body?.storeId
          ? String(req.body.storeId).trim()
          : undefined,
        gates: Array.isArray(req.body?.gates)
          ? req.body.gates
          : [],
        report:
          req.body?.report && typeof req.body.report === "object"
            ? req.body.report
            : {},
      },
      req.user?.id,
    );

    return res
      .status(certification.publishReady ? 200 : 409)
      .json({
        success: certification.publishReady,
        data: certification,
      });
  } catch (error) {
    return errorResponse(error, res);
  }
}

export async function listCertifications(
  req: AuthRequest,
  res: Response,
) {
  try {
    const rows = await listTemplateCertifications({
      templateSlug: String(req.params.slug || "").trim(),
      storeId: req.query.storeId
        ? String(req.query.storeId).trim()
        : undefined,
      take: req.query.take ? Number(req.query.take) : undefined,
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return errorResponse(error, res);
  }
}

export async function latestCertification(
  req: AuthRequest,
  res: Response,
) {
  try {
    const row = await getLatestTemplateCertification({
      templateSlug: String(req.params.slug || "").trim(),
      storeId: req.query.storeId
        ? String(req.query.storeId).trim()
        : undefined,
    });
    return res.json({ success: true, data: row });
  } catch (error) {
    return errorResponse(error, res);
  }
}

export async function revokeCertification(
  req: AuthRequest,
  res: Response,
) {
  try {
    const row = await revokeTemplateCertification({
      id: String(req.params.id || "").trim(),
      actorId: req.user?.id,
      reason: req.body?.reason
        ? String(req.body.reason).trim()
        : undefined,
    });
    return res.json({ success: true, data: row });
  } catch (error) {
    return errorResponse(error, res);
  }
}
