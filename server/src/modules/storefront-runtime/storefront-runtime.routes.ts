import { Router } from "express";
import { trustedStorefrontHostname } from "./hostname";
import {
  readScopedStorefrontRuntime,
  resolveStorefrontContext,
} from "./storefront-runtime.service";

const router = Router();

router.get("/runtime", async (req, res) => {
  const locale =
    String(req.headers["accept-language"] || "en")
      .split(",")[0]
      .split(";")[0]
      .trim() || "en";

  const resolution = await resolveStorefrontContext(
    trustedStorefrontHostname(req),
    locale,
  );

  if ("reason" in resolution) {
    const status =
      resolution.reason === "UNKNOWN_DOMAIN"
        ? 404
        : resolution.reason === "INTERNAL_ERROR"
          ? 500
          : 403;

    return res.status(status).json({
      success: false,
      reason: resolution.reason,
      message: resolution.message,
    });
  }

  const data = await readScopedStorefrontRuntime(resolution.context);
  return res.json({ success: true, data });
});

export default router;
