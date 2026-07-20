import { randomUUID } from "crypto";
import { existsSync } from "fs";
import path from "path";
import { Router, type NextFunction, type Response } from "express";
import prisma from "../../config/prisma";
import {
  protect,
  type AuthRequest,
} from "../auth/auth.middleware";
import {
  certifyTemplate,
  latestCertification,
  listCertifications,
  revokeCertification,
} from "./template-lifecycle.controller";
import {
  evaluateTemplateActivation,
} from "./template-lifecycle.service";

const router = Router();

const BUILT_INS = [
  {
    registryKey: "fashion",
    slug: "fashion",
    name: "Fashion",
    codePath: "client/src/templates/fashion",
  },
  {
    registryKey: "luxury",
    slug: "luxury",
    name: "Luxury",
    codePath: "client/src/templates/luxury",
  },
  {
    registryKey: "modern",
    slug: "modern",
    name: "Modern",
    codePath: "client/src/templates/modern",
  },
  {
    registryKey: "saqsobuild",
    slug: "saqsobuild",
    name: "SaqsoBuild",
    codePath: "client/src/templates/saqsobuild",
  },
] as const;


function templateSourceCandidates(codePath: string): string[] {
  const normalized = codePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return [
    path.resolve(process.cwd(), normalized),
    path.resolve(process.cwd(), "..", normalized),
    path.resolve(process.cwd(), "../..", normalized),
  ];
}

function templateSourceExists(codePath: string | null | undefined): boolean {
  if (!codePath) return false;
  return templateSourceCandidates(codePath).some((candidate) =>
    existsSync(candidate),
  );
}

function inferredTemplateCodePath(slug: string): string {
  return `client/src/templates/${slug}`;
}

function clean(value: unknown): string {
  return String(value || "").trim();
}

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] || "" : clean(value);
}

function requireSuperAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (String(req.user?.role || "").toUpperCase() !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Super Admin access is required.",
    });
  }
  return next();
}

async function lifecycleEvent(
  req: AuthRequest,
  action: string,
  status: string,
  metadata: unknown,
) {
  await prisma.templateLifecycleEvent.create({
    data: {
      action,
      status,
      actorId: req.user?.id || null,
      metadata: (metadata || {}) as any,
    },
  });
}

router.get(
  "/registry",
  protect,
  requireSuperAdmin,
  async (_req, res) => {
    const [templates, registry, stores] = await Promise.all([
      prisma.template.findMany({
        orderBy: { name: "asc" },
        include: { stores: true },
      }),
      prisma.templateRegistryEntry.findMany({
        where: { status: { not: "STALE" } },
        orderBy: { name: "asc" },
      }),
      prisma.store.findMany({
        orderBy: { name: "asc" },
        include: {
          tenant: true,
          templates: { include: { template: true } },
          domains: true,
        },
      }),
    ]);

    return res.json({
      success: true,
      data: { templates, registry, stores, builtIns: BUILT_INS },
    });
  },
);

router.post(
  "/sync",
  protect,
  requireSuperAdmin,
  async (req, res) => {
    for (const item of BUILT_INS) {
      const template = await prisma.template.upsert({
        where: { slug: item.slug },
        create: {
          name: item.name,
          slug: item.slug,
          description: `${item.name} built-in template`,
          isActive: true,
        },
        update: { name: item.name, isActive: true },
      });

      await prisma.templateRegistryEntry.upsert({
        where: { slug: item.slug },
        create: {
          templateId: template.id,
          slug: item.slug,
          registryKey: item.registryKey,
          name: item.name,
          sourceType: "BUILT_IN",
          codePath: item.codePath,
          manifest: item as any,
          lastSyncedAt: new Date(),
        },
        update: {
          templateId: template.id,
          registryKey: item.registryKey,
          name: item.name,
          sourceType: "BUILT_IN",
          codePath: item.codePath,
          manifest: item as any,
          lastSyncedAt: new Date(),
        },
      });
    }

    const all = await prisma.template.findMany({
      include: { stores: true },
    });
    let pruned = 0;
    let stale = 0;

    for (const template of all) {
      if (BUILT_INS.some((item) => item.slug === template.slug)) {
        continue;
      }

      const existingRegistry =
        await prisma.templateRegistryEntry.findUnique({
          where: { slug: template.slug },
        });
      const codePath =
        existingRegistry?.codePath ||
        inferredTemplateCodePath(template.slug);
      const sourcePresent = templateSourceExists(codePath);

      if (!sourcePresent && template.stores.length === 0) {
        await prisma.$transaction([
          prisma.templateCertification.deleteMany({
            where: { templateSlug: template.slug },
          }),
          prisma.templateRegistryEntry.deleteMany({
            where: { slug: template.slug },
          }),
          prisma.template.delete({
            where: { id: template.id },
          }),
        ]);
        pruned += 1;
        continue;
      }

      if (!sourcePresent) {
        await prisma.templateRegistryEntry.upsert({
          where: { slug: template.slug },
          create: {
            templateId: template.id,
            slug: template.slug,
            registryKey: template.slug,
            name: template.name,
            sourceType: "IMPORTED",
            vendor: "migration-studio",
            codePath,
            health: "BROKEN",
            status: "STALE",
            manifest: {
              slug: template.slug,
              name: template.name,
              previewUrl: template.previewUrl,
              sourcePresent: false,
            } as any,
            lastSyncedAt: new Date(),
          },
          update: {
            templateId: template.id,
            name: template.name,
            sourceType: "IMPORTED",
            vendor: "migration-studio",
            codePath,
            health: "BROKEN",
            status: "STALE",
            lastSyncedAt: new Date(),
          },
        });
        stale += 1;
        continue;
      }

      await prisma.templateRegistryEntry.upsert({
        where: { slug: template.slug },
        create: {
          templateId: template.id,
          slug: template.slug,
          registryKey: template.slug,
          name: template.name,
          sourceType: "IMPORTED",
          vendor: "migration-studio",
          codePath,
          status: "REGISTERED",
          manifest: {
            slug: template.slug,
            name: template.name,
            previewUrl: template.previewUrl,
            sourcePresent: true,
          } as any,
          lastSyncedAt: new Date(),
        },
        update: {
          templateId: template.id,
          name: template.name,
          sourceType: "IMPORTED",
          vendor: "migration-studio",
          codePath,
          status: "REGISTERED",
          lastSyncedAt: new Date(),
        },
      });
    }

    await lifecycleEvent(req, "REGISTRY_SYNC", "PASS", {
      builtIns: BUILT_INS.length,
      total: all.length,
      pruned,
      stale,
    });

    return res.json({
      success: true,
      data: {
        builtIns: BUILT_INS.length,
        total: all.length,
        pruned,
        stale,
      },
    });
  },
);

router.post(
  "/health/:slug",
  protect,
  requireSuperAdmin,
  async (req, res) => {
    const slug = routeParam(req.params.slug);
    const [template, registry] = await Promise.all([
      prisma.template.findUnique({ where: { slug } }),
      prisma.templateRegistryEntry.findUnique({ where: { slug } }),
    ]);

    const checks = {
      databaseTemplate: Boolean(template),
      registryEntry: Boolean(registry),
      codePath: templateSourceExists(registry?.codePath),
      manifest: Boolean(registry?.manifest),
      catalogActive: Boolean(template?.isActive),
    };
    const score = Math.round(
      (Object.values(checks).filter(Boolean).length /
        Object.keys(checks).length) *
        100,
    );
    const health =
      score === 100 ? "HEALTHY" : score >= 60 ? "WARNING" : "BROKEN";

    if (registry) {
      await prisma.templateRegistryEntry.update({
        where: { id: registry.id },
        data: {
          health,
          lastHealthAt: new Date(),
        },
      });
    }

    await lifecycleEvent(req, "HEALTH_CHECK", health, {
      slug,
      score,
      checks,
    });

    return res.json({
      success: true,
      data: { slug, health, score, checks },
    });
  },
);

router.get(
  "/events",
  protect,
  requireSuperAdmin,
  async (_req, res) => {
    return res.json({
      success: true,
      data: await prisma.templateLifecycleEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    });
  },
);

router.post(
  "/templates/:slug/certify",
  protect,
  requireSuperAdmin,
  certifyTemplate,
);
router.get(
  "/templates/:slug/certifications",
  protect,
  requireSuperAdmin,
  listCertifications,
);
router.get(
  "/templates/:slug/certifications/latest",
  protect,
  requireSuperAdmin,
  latestCertification,
);
router.post(
  "/certifications/:id/revoke",
  protect,
  requireSuperAdmin,
  revokeCertification,
);

router.get(
  "/assignments/:id/activation-eligibility",
  protect,
  requireSuperAdmin,
  async (req, res) => {
    const result = await evaluateTemplateActivation(
      routeParam(req.params.id),
    );
    return res.status(result.eligible ? 200 : 409).json({
      success: result.eligible,
      data: result,
    });
  },
);

router.post(
  "/activate/:id",
  protect,
  requireSuperAdmin,
  async (req, res) => {
    const id = routeParam(req.params.id);
    const eligibility = await evaluateTemplateActivation(id);

    if (!eligibility.eligible) {
      return res.status(409).json({
        success: false,
        code: eligibility.code,
        message: eligibility.message,
        data: eligibility,
      });
    }

    const target = await prisma.storeTemplate.findUnique({
      where: { id },
      include: { template: true, store: true },
    });
    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    const previous = await prisma.storeTemplate.findFirst({
      where: {
        storeId: target.storeId,
        isActive: true,
      },
      include: { template: true },
    });
    const snapshotId = randomUUID();

    await prisma.$transaction(async (tx) => {
      await tx.storeTemplate.updateMany({
        where: { storeId: target.storeId },
        data: { isActive: false },
      });
      await tx.storeTemplate.update({
        where: { id },
        data: { isActive: true },
      });
      await tx.storeSetting.updateMany({
        where: { singletonKey: `store:${target.storeId}` },
        data: { activeTemplate: target.template.slug },
      });
    });

    await prisma.templateActivationSnapshot.create({
      data: {
        id: snapshotId,
        storeId: target.storeId,
        previousAssignmentId: previous?.id || null,
        nextAssignmentId: id,
        previousTemplateSlug: previous?.template?.slug || null,
        nextTemplateSlug: target.template.slug,
        status: "READY",
      },
    });

    await prisma.templateLifecycleEvent.create({
      data: {
        templateId: target.templateId,
        storeId: target.storeId,
        assignmentId: target.id,
        action: "ACTIVATE",
        status: "PASS",
        actorId: req.user?.id || null,
        metadata: {
          snapshotId,
          certificationId: eligibility.certification?.id,
        } as any,
      },
    });

    return res.json({
      success: true,
      data: {
        activeTemplate: target.template.slug,
        previousTemplate: previous?.template?.slug || null,
        snapshotId,
        certification: eligibility.certification,
      },
    });
  },
);

router.post(
  "/rollback/:storeId",
  protect,
  requireSuperAdmin,
  async (req, res) => {
    const storeId = routeParam(req.params.storeId);
    const snapshot =
      await prisma.templateActivationSnapshot.findFirst({
        where: { storeId, status: "READY" },
        orderBy: { createdAt: "desc" },
      });

    if (!snapshot?.previousAssignmentId) {
      return res.status(404).json({
        success: false,
        message: "No rollback snapshot is available.",
      });
    }

    const previous = await prisma.storeTemplate.findUnique({
      where: { id: snapshot.previousAssignmentId },
      include: { template: true },
    });
    if (!previous) {
      return res.status(409).json({
        success: false,
        message: "Previous assignment no longer exists.",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.storeTemplate.updateMany({
        where: { storeId },
        data: { isActive: false },
      });
      await tx.storeTemplate.update({
        where: { id: previous.id },
        data: { isActive: true },
      });
      await tx.storeSetting.updateMany({
        where: { singletonKey: `store:${storeId}` },
        data: { activeTemplate: previous.template.slug },
      });
    });

    await prisma.templateActivationSnapshot.update({
      where: { id: snapshot.id },
      data: {
        status: "RESTORED",
        restoredAt: new Date(),
      },
    });

    await prisma.templateLifecycleEvent.create({
      data: {
        templateId: previous.templateId,
        storeId,
        assignmentId: previous.id,
        action: "ROLLBACK",
        status: "PASS",
        actorId: req.user?.id || null,
        metadata: { snapshotId: snapshot.id } as any,
      },
    });

    return res.json({
      success: true,
      data: { activeTemplate: previous.template.slug },
    });
  },
);

export default router;
