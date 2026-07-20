import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { generateHomepageHeroAiCopy } from "./hero-ai.service";

import {
  getHeroesService,
  createHeroService,
  updateHeroService,
  deleteHeroService,
} from "./homepage-hero.service";
import { homepageHeroSchema, homepageHeroUpdateSchema } from "./homepage-hero.validation";

function heroScope(req: Request) { const tenantId = String(req.user?.tenantId || "").trim(); const storeId = String(req.user?.storeId || "").trim(); return tenantId && storeId ? { tenantId, storeId } : undefined; }

export const getHeroesController = async (req: Request, res: Response) => {
  try {
    const data = await getHeroesService(heroScope(req));

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

export const createHeroController = async (req: Request, res: Response) => {
  try {
    const scope = heroScope(req); if (!scope) return res.status(403).json({ success: false, message: "Tenant and store context required" });
    const data = await createHeroService(scope, homepageHeroSchema.parse(req.body));

    return res.status(201).json({
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

export const updateHeroController = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Hero id is required",
      });
    }

    const scope = heroScope(req); if (!scope) return res.status(403).json({ success: false, message: "Tenant and store context required" });
    const data = await updateHeroService(scope, id, homepageHeroUpdateSchema.parse(req.body));

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

export const deleteHeroController = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Hero id is required",
      });
    }

    const scope = heroScope(req); if (!scope) return res.status(403).json({ success: false, message: "Tenant and store context required" });
    const data = await deleteHeroService(scope, id);

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

export const uploadHeroMediaController = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const uploadDir = "public/uploads/homepage-hero";
    const ext = path.extname(file.filename).toLowerCase();
    const base = path.basename(file.filename, ext);

    const originalUrl = `/uploads/homepage-hero/${file.filename}`;

    let desktopUrl = originalUrl;
    let tabletUrl = originalUrl;
    let mobileUrl = originalUrl;

    if (file.mimetype?.startsWith("image/")) {
      const desktopFile = `${base}-desktop-4k.webp`;
      const tabletFile = `${base}-tablet.webp`;
      const mobileFile = `${base}-mobile.webp`;

      await sharp(file.path)
        .resize({ width: 3840, withoutEnlargement: true })
        .webp({ quality: 92 })
        .toFile(path.join(uploadDir, desktopFile));

      await sharp(file.path)
        .resize({ width: 1536, withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(path.join(uploadDir, tabletFile));

      await sharp(file.path)
        .resize({ width: 768, withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(path.join(uploadDir, mobileFile));

      desktopUrl = `/uploads/homepage-hero/${desktopFile}`;
      tabletUrl = `/uploads/homepage-hero/${tabletFile}`;
      mobileUrl = `/uploads/homepage-hero/${mobileFile}`;
    }

    return res.json({
      success: true,
      data: {
        url: originalUrl,
        desktopSrc: desktopUrl,
        tabletSrc: tabletUrl,
        mobileSrc: mobileUrl,
        fullUrl: `http://localhost:5000${originalUrl}`,
        fileName: file.filename,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const aiGenerateHeroController = async (req: Request, res: Response) => {
  try {
    const result = await generateHomepageHeroAiCopy({
      filename: req.body?.filename,
      url: req.body?.url,
      businessType: req.body?.businessType || "fashion",
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "AI hero generation failed",
    });
  }
};

