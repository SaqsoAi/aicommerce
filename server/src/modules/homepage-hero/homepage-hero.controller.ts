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

export const getHeroesController = async (_req: Request, res: Response) => {
  try {
    const data = await getHeroesService();

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
    const data = await createHeroService(req.body);

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

    const data = await updateHeroService(id, req.body);

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

    const data = await deleteHeroService(id);

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

