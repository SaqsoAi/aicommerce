import type { Request, Response } from "express";
import {
  createHomepageSectionService,
  deleteHomepageSectionService,
  getHomepageSectionsService,
  reorderHomepageSectionsService,
  toggleHomepageSectionService,
  updateHomepageSectionService,
  type HomepageOwnershipScope,
} from "./homepage-section.service";
import { homepageSectionReorderSchema, homepageSectionSchema, homepageSectionToggleSchema, homepageSectionUpdateSchema } from "./homepage-section.validation";
import { HOMEPAGE_SECTION_DEFINITIONS } from "./homepage-section.definitions";

function scopeFromRequest(req: Request): HomepageOwnershipScope {
  const tenantId = String(req.user?.tenantId || "").trim();
  const storeId = String(req.user?.storeId || "").trim();

  if (!tenantId || !storeId) {
    throw Object.assign(
      new Error("Authenticated tenant and store context are required"),
      { statusCode: 403 },
    );
  }

  return { tenantId, storeId };
}

function fail(res: Response, error: unknown, fallback = 400) {
  const candidate = error as { message?: string; statusCode?: number };

  return res.status(candidate.statusCode || fallback).json({
    success: false,
    message: candidate.message || "Homepage operation failed",
  });
}

export async function getHomepageSections(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      data: await getHomepageSectionsService(scopeFromRequest(req)),
    });
  } catch (error) {
    return fail(res, error, 500);
  }
}

export async function createHomepageSection(req: Request, res: Response) {
  try {
    const body = homepageSectionSchema.parse(req.body);

    return res.status(201).json({
      success: true,
      data: await createHomepageSectionService(scopeFromRequest(req), body),
    });
  } catch (error) {
    return fail(res, error);
  }
}

export async function updateHomepageSection(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      data: await updateHomepageSectionService(
        scopeFromRequest(req),
        String(req.params.id),
        homepageSectionUpdateSchema.parse(req.body),
      ),
    });
  } catch (error) {
    return fail(res, error);
  }
}

export async function deleteHomepageSection(req: Request, res: Response) {
  try {
    await deleteHomepageSectionService(
      scopeFromRequest(req),
      String(req.params.id),
    );

    return res.json({ success: true });
  } catch (error) {
    return fail(res, error);
  }
}

export async function reorderHomepageSectionsController(
  req: Request,
  res: Response,
) {
  try {
    const { items } = homepageSectionReorderSchema.parse(req.body);

    return res.json({
      success: true,
      data: await reorderHomepageSectionsService(
        scopeFromRequest(req),
        items,
      ),
    });
  } catch (error) {
    return fail(res, error, 500);
  }
}

export async function toggleHomepageSectionController(
  req: Request,
  res: Response,
) {
  try {
    const id = String(req.params.id || "");

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Section id is required",
      });
    }

    return res.json({
      success: true,
      data: await toggleHomepageSectionService(
        scopeFromRequest(req),
        id,
        homepageSectionToggleSchema.parse(req.body).enabled,
      ),
    });
  } catch (error) {
    return fail(res, error, 500);
  }
}

export async function getHomepageSectionDefinitions(_req: Request, res: Response) {
  return res.json({ success: true, data: HOMEPAGE_SECTION_DEFINITIONS });
}
