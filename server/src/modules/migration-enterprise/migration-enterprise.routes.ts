import { randomUUID } from "crypto";
import { Router } from "express";
import prisma from "../../config/prisma";
import {
  protect,
  type AuthRequest,
} from "../auth/auth.middleware";

const router = Router();

function clean(value: unknown): string {
  return String(value || "").trim();
}

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] || "" : clean(value);
}

function requireSuperAdmin(req: AuthRequest, res: any, next: any) {
  if (String(req.user?.role || "").toUpperCase() !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Super Admin access is required.",
    });
  }
  return next();
}

const STAGES = [
  "UPLOAD",
  "SAFE_EXTRACT",
  "FRAMEWORK_DISCOVERY",
  "ROUTE_COMPONENT_STYLE_API_DISCOVERY",
  "DATA_MODEL_DISCOVERY",
  "GAP_DETECTION",
  "MIGRATION_PLAN",
  "CODE_GENERATION",
  "DATABASE_PS1",
  "SERVER_API",
  "ADMIN_FORMS",
  "CLIENT_PAGES",
  "RESPONSIVE_REPAIR",
  "BUILD",
  "INSTALL",
  "CERTIFICATION",
] as const;

const ACTIVATION_GATES = [
  "databasePowerShell",
  "prismaValidation",
  "serverApi",
  "apiContract",
  "duplicateApiCheck",
  "permission",
  "tenantIsolation",
  "ownership",
  "adminBuild",
  "clientBuild",
  "runtimeHealth",
] as const;

async function event(
  runId: string,
  stage: string,
  status: string,
  actorId?: string,
  details: unknown = {},
) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO migration_pipeline_events
      (id, run_id, stage, status, actor_id, details)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
    randomUUID(),
    runId,
    stage,
    status,
    actorId || null,
    JSON.stringify(details || {}),
  );
}

router.get("/capabilities", protect, requireSuperAdmin, async (_req, res) => {
  return res.json({
    success: true,
    data: {
      engineVersion: "2026.33.8",
      stages: STAGES,
      activationGates: ACTIVATION_GATES,
      frameworkSupport: [
        "NEXT_APP_ROUTER",
        "NEXT_PAGES_ROUTER",
        "REACT_VITE",
        "REACT_CRA",
        "LARAVEL",
        "HTML_CSS_JS",
      ],
      policies: {
        sourceDesign: "KEEP_DESIGN_REPLACE_DATA_SOURCE",
        existingApi: "REUSE_BEFORE_GENERATE",
        unsupportedBusinessLogic: "REVIEW_REQUIRED_OR_BLOCKED",
        databaseExecution: "POWERSHELL_ONLY",
        codeExecution: "PLUGIN_TRANSACTION_ONLY",
      },
    },
  });
});

router.post("/runs", protect, requireSuperAdmin, async (req, res) => {
  const id = randomUUID();
  const tenantId = clean(req.body?.tenantId) || null;
  const storeId = clean(req.body?.storeId) || null;
  const templateKey = clean(req.body?.templateKey);
  const sourceName = clean(req.body?.sourceName);

  if (!templateKey || !sourceName) {
    return res.status(400).json({
      success: false,
      message: "Template key and source name are required.",
    });
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO migration_pipeline_runs
      (id, tenant_id, store_id, template_key, source_name,
       framework, status, current_stage, created_by, metadata)
     VALUES ($1,$2,$3,$4,$5,'UNKNOWN','DRAFT','UPLOAD',$6,$7::jsonb)`,
    id,
    tenantId,
    storeId,
    templateKey,
    sourceName,
    req.user?.id || null,
    JSON.stringify(req.body?.metadata || {}),
  );
  await event(id, "UPLOAD", "PASS", req.user?.id, { sourceName });

  return res.status(201).json({ success: true, data: { id } });
});

router.get("/runs", protect, requireSuperAdmin, async (_req, res) => {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM migration_pipeline_runs ORDER BY created_at DESC LIMIT 200`,
  );
  return res.json({ success: true, data: rows });
});

router.get("/runs/:id", protect, requireSuperAdmin, async (req, res) => {
  const id = routeParam(req.params.id);
  const runs = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM migration_pipeline_runs WHERE id = $1 LIMIT 1`,
    id,
  );
  if (!runs[0]) {
    return res.status(404).json({ success: false, message: "Migration run not found." });
  }

  const [events, artifacts, mappings, entities, visual, findings, certificates] =
    await Promise.all([
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM migration_pipeline_events WHERE run_id = $1 ORDER BY created_at ASC`,
        id,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM migration_artifacts WHERE run_id = $1 ORDER BY created_at ASC`,
        id,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM migration_api_mappings WHERE run_id = $1 ORDER BY created_at ASC`,
        id,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM migration_entity_plans WHERE run_id = $1 ORDER BY created_at ASC`,
        id,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM migration_visual_results WHERE run_id = $1 ORDER BY created_at ASC`,
        id,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM migration_security_findings WHERE run_id = $1 ORDER BY created_at ASC`,
        id,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM migration_certificates WHERE run_id = $1 ORDER BY created_at DESC`,
        id,
      ),
    ]);

  return res.json({
    success: true,
    data: {
      run: runs[0],
      events,
      artifacts,
      mappings,
      entities,
      visual,
      findings,
      certificates,
    },
  });
});

router.post("/runs/:id/stage", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const stage = clean(req.body?.stage).toUpperCase();
  const status = clean(req.body?.status).toUpperCase();
  const allowedStatus = ["PASS", "FAIL", "BLOCKED", "REVIEW_REQUIRED", "PENDING"];

  if (!STAGES.includes(stage as any) || !allowedStatus.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid stage or status." });
  }

  await prisma.$executeRawUnsafe(
    `UPDATE migration_pipeline_runs
        SET current_stage = $1,
            status = CASE
              WHEN $2 IN ('FAIL','BLOCKED') THEN 'BLOCKED'
              WHEN $2 = 'PASS' AND $1 = 'CERTIFICATION' THEN 'CERTIFIED'
              ELSE status
            END,
            updated_at = NOW()
      WHERE id = $3`,
    stage,
    status,
    runId,
  );
  await event(runId, stage, status, req.user?.id, req.body?.details || {});

  return res.json({ success: true });
});

router.post("/runs/:id/framework-analysis", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const files = Array.isArray(req.body?.files)
    ? req.body.files.map((item: unknown) => clean(item).replace(/\\/g, "/"))
    : [];
  const source = clean(req.body?.sourceText);

  const pathTraversal = files.filter(
    (name: string) =>
      name.startsWith("/") ||
      /^[A-Za-z]:\//.test(name) ||
      name.split("/").includes(".."),
  );
  const dangerous = files.filter((name: string) =>
    /\.(exe|dll|com|bat|cmd|scr|msi|ps1|vbs|jar)$/i.test(name),
  );

  const framework =
    files.some((name: string) => /artisan$|composer\.json$/.test(name))
      ? "LARAVEL"
      : files.some((name: string) => /app\/.*page\.(tsx|jsx)$/.test(name))
        ? "NEXT_APP_ROUTER"
        : files.some((name: string) => /pages\/.*\.(tsx|jsx)$/.test(name))
          ? "NEXT_PAGES_ROUTER"
          : files.some((name: string) => /vite\.config\./.test(name))
            ? "REACT_VITE"
            : files.some((name: string) => /package\.json$/.test(name))
              ? "REACT_CRA"
              : files.some((name: string) => /\.html?$/.test(name))
                ? "HTML_CSS_JS"
                : "UNKNOWN";

  const laravel = {
    blade: files.filter((name: string) => /\.blade\.php$/.test(name)),
    routes: files.filter((name: string) => /routes\/(web|api)\.php$/.test(name)),
    controllers: files.filter((name: string) => /app\/Http\/Controllers\/.*\.php$/.test(name)),
    models: files.filter((name: string) => /app\/Models\/.*\.php$/.test(name)),
    validation: files.filter((name: string) => /app\/Http\/Requests\/.*\.php$/.test(name)),
    policies: files.filter((name: string) => /app\/Policies\/.*\.php$/.test(name)),
    migrations: files.filter((name: string) => /database\/migrations\/.*\.php$/.test(name)),
    authSignals: /\bAuth::|\bauth\(|middleware\s*\(\s*['"]auth/.test(source),
    unsupportedSignals: [
      /\bDB::transaction\b/.test(source) ? "DB_TRANSACTION" : "",
      /\bdispatch\s*\(/.test(source) ? "QUEUE_DISPATCH" : "",
      /\bevent\s*\(/.test(source) ? "EVENT_DISPATCH" : "",
      /Route::group|middleware\s*\(/.test(source) ? "ROUTE_GROUP_OR_MIDDLEWARE" : "",
    ].filter(Boolean),
  };

  const securityStatus =
    pathTraversal.length || dangerous.length ? "BLOCKED" : "PASS";

  for (const finding of [
    ...pathTraversal.map((path: string) => ({
      severity: "CRITICAL",
      code: "PATH_TRAVERSAL",
      path,
    })),
    ...dangerous.map((path: string) => ({
      severity: "HIGH",
      code: "DANGEROUS_FILE",
      path,
    })),
  ]) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO migration_security_findings
        (id, run_id, severity, code, path, details, status)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,'OPEN')`,
      randomUUID(),
      runId,
      finding.severity,
      finding.code,
      finding.path,
      JSON.stringify(finding),
    );
  }

  await prisma.$executeRawUnsafe(
    `UPDATE migration_pipeline_runs
        SET framework = $1, updated_at = NOW()
      WHERE id = $2`,
    framework,
    runId,
  );
  await event(
    runId,
    "SAFE_EXTRACT",
    securityStatus,
    req.user?.id,
    { pathTraversal, dangerous },
  );
  await event(
    runId,
    "FRAMEWORK_DISCOVERY",
    framework === "UNKNOWN" ? "REVIEW_REQUIRED" : "PASS",
    req.user?.id,
    { framework, laravel },
  );

  return res.status(securityStatus === "PASS" ? 200 : 409).json({
    success: securityStatus === "PASS",
    data: { framework, securityStatus, pathTraversal, dangerous, laravel },
  });
});

router.post("/runs/:id/api-mappings", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const mappings = Array.isArray(req.body?.mappings) ? req.body.mappings : [];

  for (const item of mappings) {
    const sourceMethod = clean(item?.sourceMethod || "GET").toUpperCase();
    const sourcePath = clean(item?.sourcePath);
    const platformMethod = clean(item?.platformMethod || sourceMethod).toUpperCase();
    const platformPath = clean(item?.platformPath);
    const action = clean(item?.action || "REUSE").toUpperCase();
    const duplicateKey = `${platformMethod}:${platformPath}`;

    const existing = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM migration_api_mappings
        WHERE run_id = $1 AND duplicate_key = $2 LIMIT 1`,
      runId,
      duplicateKey,
    );
    if (existing[0]) {
      return res.status(409).json({
        success: false,
        message: `Duplicate API mapping: ${duplicateKey}`,
      });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO migration_api_mappings
        (id, run_id, source_method, source_path, platform_method,
         platform_path, action, duplicate_key, field_map, auth_adapter, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,'PLANNED')`,
      randomUUID(),
      runId,
      sourceMethod,
      sourcePath,
      platformMethod,
      platformPath,
      action,
      duplicateKey,
      JSON.stringify(item?.fieldMap || {}),
      JSON.stringify(item?.authAdapter || {}),
    );
  }

  await event(runId, "ROUTE_COMPONENT_STYLE_API_DISCOVERY", "PASS", req.user?.id, {
    mappings: mappings.length,
  });
  return res.status(201).json({ success: true, data: { count: mappings.length } });
});

router.post("/runs/:id/entities", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const entities = Array.isArray(req.body?.entities) ? req.body.entities : [];

  for (const entity of entities) {
    const entityKey = clean(entity?.key);
    if (!entityKey) continue;
    await prisma.$executeRawUnsafe(
      `INSERT INTO migration_entity_plans
        (id, run_id, entity_key, source_model, platform_model, action,
         fields, permission_key, menu_path, form_status, gate_results, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,'DRAFT',$10::jsonb,'PLANNED')
       ON CONFLICT (run_id, entity_key) DO UPDATE SET
         source_model = EXCLUDED.source_model,
         platform_model = EXCLUDED.platform_model,
         action = EXCLUDED.action,
         fields = EXCLUDED.fields,
         permission_key = EXCLUDED.permission_key,
         menu_path = EXCLUDED.menu_path,
         updated_at = NOW()`,
      randomUUID(),
      runId,
      entityKey,
      clean(entity?.sourceModel) || null,
      clean(entity?.platformModel) || null,
      clean(entity?.action || "GENERATE").toUpperCase(),
      JSON.stringify(entity?.fields || []),
      clean(entity?.permissionKey) || null,
      clean(entity?.menuPath) || null,
      JSON.stringify({}),
    );
  }

  await event(runId, "DATA_MODEL_DISCOVERY", "PASS", req.user?.id, {
    entities: entities.length,
  });
  return res.status(201).json({ success: true, data: { count: entities.length } });
});

router.post("/runs/:id/entities/:entityKey/gates", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const entityKey = routeParam(req.params.entityKey);
  const gates = req.body?.gates || {};
  const failed = ACTIVATION_GATES.filter((gate) => gates[gate] !== "PASS");
  const canActivate = failed.length === 0;

  await prisma.$executeRawUnsafe(
    `UPDATE migration_entity_plans
        SET gate_results = $1::jsonb,
            form_status = $2,
            status = $3,
            updated_at = NOW()
      WHERE run_id = $4 AND entity_key = $5`,
    JSON.stringify(gates),
    canActivate ? "ACTIVATED" : "DISABLED",
    canActivate ? "PASS" : "BLOCKED",
    runId,
    entityKey,
  );

  return res.status(canActivate ? 200 : 409).json({
    success: canActivate,
    data: { entityKey, canActivate, failed },
  });
});

router.post("/runs/:id/client-completion", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const present = new Set(
    (Array.isArray(req.body?.presentPages) ? req.body.presentPages : [])
      .map((item: unknown) => clean(item).toLowerCase()),
  );
  const required = [
    "home",
    "category",
    "search",
    "product",
    "cart",
    "checkout",
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "account",
    "profile",
    "addresses",
    "orders",
    "order-detail",
    "wishlist",
    "reviews",
    "returns",
    "refund-status",
    "lookbook",
    "membership",
    "rewards",
    "campaign",
    "about",
    "contact",
    "404",
  ];
  const missing = required.filter((page) => !present.has(page));
  const result = {
    required,
    present: Array.from(present),
    missing,
    action: missing.length ? "GENERATE_FROM_SOURCE_DESIGN_SYSTEM" : "KEEP",
    responsiveMatrix: [320, 360, 390, 414, 768, 1024, 1366, 1440, 1920],
    assetPolicy: "HASH_DEDUPE_AND_PRESERVE_REFERENCES",
    stateConversion: "REACT_ROUTER_AND_FETCH_TO_NEXT_APP_ROUTER_ADAPTER",
  };

  await prisma.$executeRawUnsafe(
    `INSERT INTO migration_artifacts
      (id, run_id, artifact_type, path, content_type, metadata, status)
     VALUES ($1,$2,'CLIENT_COMPLETION_PLAN',$3,'application/json',$4::jsonb,'GENERATED')`,
    randomUUID(),
    runId,
    `completion/${runId}/client-pages.json`,
    JSON.stringify(result),
  );
  await event(runId, "CLIENT_PAGES", missing.length ? "REVIEW_REQUIRED" : "PASS", req.user?.id, result);
  return res.json({ success: true, data: result });
});

router.post("/runs/:id/visual-results", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const results = Array.isArray(req.body?.results) ? req.body.results : [];

  for (const item of results) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO migration_visual_results
        (id, run_id, route_path, viewport, screenshot_score, dom_score,
         computed_style_score, geometry_score, overflow, diff_artifact, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      randomUUID(),
      runId,
      clean(item?.routePath),
      clean(item?.viewport),
      Number(item?.screenshotScore || 0),
      Number(item?.domScore || 0),
      Number(item?.computedStyleScore || 0),
      Number(item?.geometryScore || 0),
      Boolean(item?.overflow),
      clean(item?.diffArtifact) || null,
      (
        Number(item?.screenshotScore || 0) >= 95 &&
        Number(item?.domScore || 0) >= 95 &&
        Number(item?.computedStyleScore || 0) >= 95 &&
        Number(item?.geometryScore || 0) >= 92 &&
        !Boolean(item?.overflow)
      ) ? "PASS" : "BLOCKED",
    );
  }

  const failed = results.filter((item: any) =>
    Number(item?.screenshotScore || 0) < 95 ||
    Number(item?.domScore || 0) < 95 ||
    Number(item?.computedStyleScore || 0) < 95 ||
    Number(item?.geometryScore || 0) < 92 ||
    Boolean(item?.overflow),
  );
  await event(runId, "RESPONSIVE_REPAIR", failed.length ? "BLOCKED" : "PASS", req.user?.id, {
    results: results.length,
    failed: failed.length,
  });

  return res.status(failed.length ? 409 : 201).json({
    success: failed.length === 0,
    data: { count: results.length, failed: failed.length },
  });
});

router.post("/runs/:id/preflight", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const checks = req.body?.checks || {};
  const required = [
    "archiveIntegrity",
    "manifest",
    "ownership",
    "conflicts",
    "idempotency",
    "databaseRollback",
    "fileRollback",
    "security",
  ];
  const failed = required.filter((key) => checks[key] !== "PASS");

  await prisma.$executeRawUnsafe(
    `INSERT INTO migration_installation_plans
      (id, run_id, status, checks, rollback_plan, idempotency_key)
     VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6)`,
    randomUUID(),
    runId,
    failed.length ? "BLOCKED" : "READY",
    JSON.stringify(checks),
    JSON.stringify(req.body?.rollbackPlan || {}),
    clean(req.body?.idempotencyKey) || `${runId}:default`,
  );
  await event(runId, "INSTALL", failed.length ? "BLOCKED" : "PASS", req.user?.id, { failed });

  return res.status(failed.length ? 409 : 200).json({
    success: failed.length === 0,
    data: { status: failed.length ? "BLOCKED" : "READY", failed },
  });
});

router.post("/runs/:id/certify", protect, requireSuperAdmin, async (req, res) => {
  const runId = routeParam(req.params.id);
  const gates = req.body?.gates || {};
  const required = [
    "safeExtract",
    "frameworkDiscovery",
    "routeDiscovery",
    "dataModelDiscovery",
    "apiMapping",
    "databasePowerShell",
    "prismaValidation",
    "serverApi",
    "adminForms",
    "permission",
    "tenantIsolation",
    "clientPages",
    "responsive",
    "adminBuild",
    "clientBuild",
    "serverBuild",
    "installationPreflight",
    "rollback",
    "security",
    "runtime",
    "visualParity",
    "aiReconciliation",
  ];
  const failed = required.filter((key) => gates[key] !== "PASS");
  const score = Math.round(((required.length - failed.length) / required.length) * 100);
  const status = failed.length ? "BLOCKED" : "CERTIFIED";
  const certificateId = randomUUID();

  await prisma.$executeRawUnsafe(
    `INSERT INTO migration_certificates
      (id, run_id, status, score, gates, failed_gates, publish_ready, report)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8::jsonb)`,
    certificateId,
    runId,
    status,
    score,
    JSON.stringify(gates),
    JSON.stringify(failed),
    failed.length === 0,
    JSON.stringify(req.body?.report || {}),
  );
  await prisma.$executeRawUnsafe(
    `UPDATE migration_pipeline_runs
        SET status = $1,
            current_stage = 'CERTIFICATION',
            publish_ready = $2,
            updated_at = NOW()
      WHERE id = $3`,
    status,
    failed.length === 0,
    runId,
  );
  await event(runId, "CERTIFICATION", status, req.user?.id, { score, failed, certificateId });

  return res.status(failed.length ? 409 : 200).json({
    success: failed.length === 0,
    data: {
      certificateId,
      status,
      score,
      failed,
      publishReady: failed.length === 0,
    },
  });
});

export default router;
