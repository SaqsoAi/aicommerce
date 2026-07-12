import { Router } from "express";
import { authenticate, AuthRequest } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { pluginPlatformService } from "./plugin-platform.service";
import { validateManifest } from "./plugin-platform.validation";
import { parsePluginPackage } from "./plugin-platform.transaction.archive";
import { pluginTransactionService } from "./plugin-platform.transaction.service";
import { pluginAccessService } from "./plugin-platform.access.service";
import { pluginRegistryService } from "./plugin-platform.registry.service";
import { pluginConfigurationService } from "./plugin-platform.configuration.service";
import { pluginTenantService } from "./plugin-platform.tenant.service";
import { pluginHealthOrchestratorService } from "./plugin-platform.health-orchestrator.service";
import { pluginMarketplaceService } from "./plugin-platform.marketplace.service";
import { pluginGuidanceService } from "./plugin-platform.guidance.service";

const router = Router();

type TenantAuthRequest = AuthRequest & {
  user?: AuthRequest["user"] & {
    tenantId?: string;
  };
};

const actor = (req: AuthRequest) =>
  req.user?.id || req.user?.userId;

const tenantContext = (req: TenantAuthRequest) => {
  const actorId = actor(req);
  const tenantId = String(req.user?.tenantId || "").trim();
  const role = String(req.user?.role || "").toUpperCase();

  if (!actorId) {
    throw Object.assign(new Error("Unauthorized"), {
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  return {
    actorId,
    tenantId,
    role,
  };
};

const wrap = (fn: any) =>
  async (
    req: TenantAuthRequest,
    res: any,
    _next: any
  ) => {
    try {
      const id = actor(req);
      if (!id) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const data = await fn(req, id);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(error?.statusCode || 500).json({
        success: false,
        code: error?.code,
        message:
          error instanceof Error
            ? error.message
            : "Plugin request failed",
        issues: error?.issues,
      });
    }
  };

router.use(authenticate);

router.get(
  "/tenant/visibility",
  wrap((req: TenantAuthRequest) =>
    pluginTenantService.visibility(tenantContext(req))
  )
);

router.get(
  "/tenant/configuration/:pluginKey",
  wrap((req: TenantAuthRequest) =>
    pluginTenantService.configuration(
      String(req.params.pluginKey),
      tenantContext(req)
    )
  )
);

router.post(
  "/tenant/configuration/:pluginKey/validate",
  wrap((req: TenantAuthRequest) =>
    pluginTenantService.validate({
      pluginKey: String(req.params.pluginKey),
      settingKey: String(req.body?.settingKey || ""),
      value: req.body?.value,
      context: tenantContext(req),
    })
  )
);

router.put(
  "/tenant/configuration/:pluginKey/:settingKey",
  wrap((req: TenantAuthRequest) =>
    pluginTenantService.save({
      pluginKey: String(req.params.pluginKey),
      settingKey: String(req.params.settingKey),
      value: req.body?.value,
      reason: req.body?.reason,
      context: tenantContext(req),
    })
  )
);

router.get(
  "/tenant/configuration/:pluginKey/history",
  wrap((req: TenantAuthRequest) =>
    pluginTenantService.history(
      String(req.params.pluginKey),
      tenantContext(req)
    )
  )
);

router.use(permission("*"));
router.get("/",async(_req,res,next)=>{try{res.json({success:true,data:await pluginPlatformService.list()});}catch(e){next(e);}});
router.post("/validate-manifest",(req,res)=>{const result=validateManifest(req.body);res.status(result.issues.length?422:200).json({success:!result.issues.length,...result});});
router.post("/validate-archive",(req,res)=>{
  try {
    const encoded=String(req.body?.archiveBase64||"");
    const parsed=parsePluginPackage(encoded);
    const entries=[...parsed.files.entries()].map(([path,content])=>({
      path,
      compressedSize:content.length,
      uncompressedSize:content.length,
    }));
    return res.status(200).json({
      success:true,
      sha256:parsed.packageSha256,
      entries,
      manifest:parsed.manifest,
      issues:[],
    });
  } catch (error:any) {
    return res.status(error?.statusCode || 422).json({
      success:false,
      issues:[{
        code:error?.code || "PKG_ARCHIVE_INVALID",
        message:error instanceof Error ? error.message : "Invalid ZIP archive",
      }],
    });
  }
});
router.post("/plans",async(req:AuthRequest,res,next)=>{try{const id=actor(req);if(!id)return res.status(401).json({success:false,message:"Unauthorized"});const packageSha256=String(req.body?.packageSha256||"");if(!/^[a-f0-9]{64}$/.test(packageSha256))return res.status(422).json({success:false,issues:[{code:"PKG_HASH_FORMAT",message:"packageSha256 is required"}]});const result=await pluginPlatformService.createPlan(req.body?.manifest,packageSha256,id);return res.status(result.issues.length?409:201).json({success:!result.issues.length,...result});}catch(e){return next(e);}});
router.post("/installations/:fingerprint/approve",wrap((req:any,id:string)=>pluginPlatformService.approveInstallation(String(req.params.fingerprint),id,req.body?.reason)));
router.post("/transactions/execute",wrap((req:any,id:string)=>pluginTransactionService.execute({
  planFingerprint:String(req.body?.planFingerprint||""),
  archiveBase64:String(req.body?.archiveBase64||""),
  reason:req.body?.reason,
},id)));
router.get("/transactions",wrap((req:any)=>pluginTransactionService.list(req.query?.pluginKey ? String(req.query.pluginKey) : undefined)));
router.get("/transactions/:transactionId",wrap((req:any)=>pluginTransactionService.get(String(req.params.transactionId))));
router.post("/transactions/:transactionId/migration-review",wrap((req:any,id:string)=>pluginTransactionService.resumeMigrationGate(String(req.params.transactionId),id,req.body?.reason)));
router.get("/access/evaluate",wrap((req:any)=>pluginAccessService.evaluate(
  String(req.query?.pluginKey||""),
  String(req.query?.tenantId||""),
  String(req.query?.refresh||"") === "true"
)));
router.get("/access/matrix/:tenantId",wrap((req:any)=>pluginAccessService.matrix(String(req.params.tenantId))));
router.post("/access/invalidate",wrap((req:any)=>({
  invalidated: pluginAccessService.invalidate(
    req.body?.pluginKey ? String(req.body.pluginKey) : undefined,
    req.body?.tenantId ? String(req.body.tenantId) : undefined
  )
})));
router.get("/registry/snapshot",wrap((req:any)=>pluginRegistryService.snapshot(String(req.query?.refresh||"") === "true")));
router.get("/registry/health",wrap((req:any)=>pluginRegistryService.health(String(req.query?.refresh||"") === "true")));
router.get("/registry/resolve",wrap((req:any)=>pluginRegistryService.resolve({
  tenantId:req.query?.tenantId ? String(req.query.tenantId) : undefined,
  role:req.query?.role ? String(req.query.role) : undefined,
  registryType:req.query?.registryType ? String(req.query.registryType) as any : undefined,
  refresh:String(req.query?.refresh||"") === "true"
})));
router.post("/registry/invalidate",wrap(()=>({
  invalidated: pluginRegistryService.invalidate()
})));
router.get("/configuration/:pluginKey",wrap((req:any)=>pluginConfigurationService.document(
  String(req.params.pluginKey),
  req.query?.tenantId ? String(req.query.tenantId) : undefined
)));
router.post("/configuration/:pluginKey/validate",wrap((req:any)=>pluginConfigurationService.validate(
  String(req.params.pluginKey),
  String(req.body?.settingKey||""),
  req.body?.value
)));
router.put("/configuration/:pluginKey/:settingKey",wrap((req:any,id:string)=>pluginConfigurationService.save({
  pluginKey:String(req.params.pluginKey),
  settingKey:String(req.params.settingKey),
  scope:String(req.body?.scope||""),
  tenantId:req.body?.tenantId ? String(req.body.tenantId) : undefined,
  value:req.body?.value,
  reason:req.body?.reason,
  actorId:id
})));
router.get("/configuration/:pluginKey/history",wrap((req:any)=>pluginConfigurationService.history(
  String(req.params.pluginKey),
  req.query?.tenantId ? String(req.query.tenantId) : undefined
)));
router.post("/:pluginKey/installations/confirm",wrap((req:any,id:string)=>pluginPlatformService.markInstalled(String(req.params.pluginKey),String(req.body?.version||""),String(req.body?.planFingerprint||""),id,req.body?.reason)));
router.post("/:pluginKey/activate",wrap((req:any,id:string)=>pluginPlatformService.activate(String(req.params.pluginKey),id,req.body?.reason)));
router.post("/:pluginKey/deactivate",wrap((req:any,id:string)=>pluginPlatformService.deactivate(String(req.params.pluginKey),id,req.body?.reason)));
router.post("/:pluginKey/upgrade",wrap((req:any,id:string)=>pluginPlatformService.upgrade(String(req.params.pluginKey),String(req.body?.targetVersion||""),id,req.body?.reason)));
router.post("/:pluginKey/rollback",wrap((req:any,id:string)=>pluginPlatformService.rollback(String(req.params.pluginKey),String(req.body?.targetVersion||""),id,req.body?.reason)));
router.post("/:pluginKey/uninstall",wrap((req:any,id:string)=>pluginPlatformService.uninstall(String(req.params.pluginKey),id,req.body?.reason)));
router.put("/:pluginKey/tenants/:tenantId",wrap((req:any,id:string)=>pluginPlatformService.setTenantAccess(String(req.params.pluginKey),String(req.params.tenantId),Boolean(req.body?.enabled),req.body?.configuration,id,req.body?.reason)));
router.put("/:pluginKey/settings/:settingKey",wrap((req:any,id:string)=>pluginPlatformService.setSetting(String(req.params.pluginKey),String(req.params.settingKey),String(req.body?.scope||""),req.body?.tenantId,req.body?.value,id,req.body?.reason)));
router.post("/:pluginKey/health/run",wrap((req:any,id:string)=>pluginPlatformService.runHealth(String(req.params.pluginKey),id)));
router.get("/:pluginKey/history",wrap((req:any)=>pluginPlatformService.versionHistory(String(req.params.pluginKey))));

router.get("/health-orchestration/platform",wrap((req:any)=>pluginHealthOrchestratorService.platformSnapshot(String(req.query?.refresh||"") === "true")));
router.get("/health-orchestration/scheduler",wrap(()=>pluginHealthOrchestratorService.schedulerState()));
router.get("/health-orchestration/:pluginKey",wrap((req:any)=>pluginHealthOrchestratorService.evaluate(String(req.params.pluginKey))));
router.post("/health-orchestration/:pluginKey/run",wrap((req:any,id:string)=>pluginHealthOrchestratorService.run(String(req.params.pluginKey),id,req.body?.reason)));
router.post("/health-orchestration/:pluginKey/quarantine",wrap((req:any,id:string)=>pluginHealthOrchestratorService.quarantine(String(req.params.pluginKey),id,req.body?.reason)));

router.get("/marketplace/catalog",wrap((req:any)=>pluginMarketplaceService.listCatalog(req.query?.channel ? String(req.query.channel) : undefined)));
router.get("/marketplace/vendors",wrap(()=>pluginMarketplaceService.vendors()));
router.get("/marketplace/repositories",wrap(()=>pluginMarketplaceService.repositories()));
router.get("/marketplace/downloads",wrap(()=>pluginMarketplaceService.downloads()));
router.post("/marketplace/vendors",wrap((req:any,id:string)=>pluginMarketplaceService.registerVendor(req.body,id)));
router.post("/marketplace/vendors/:vendorKey/keys",wrap((req:any)=>pluginMarketplaceService.registerSigningKey(String(req.params.vendorKey),req.body)));
router.post("/marketplace/repositories",wrap((req:any,id:string)=>pluginMarketplaceService.registerRepository(req.body,id)));
router.post("/marketplace/entries",wrap((req:any)=>pluginMarketplaceService.publish(req.body)));
router.post("/marketplace/evaluate",wrap((req:any)=>pluginMarketplaceService.evaluate(req.body)));
router.post("/marketplace/entries/:entryId/download",wrap((req:any,id:string)=>pluginMarketplaceService.authorizeDownload(String(req.params.entryId),id,req.body?.reason)));

router.get("/guidance",wrap(()=>pluginGuidanceService.list()));
router.get("/guidance/:pluginKey",wrap((req:any)=>pluginGuidanceService.build(String(req.params.pluginKey))));
router.get("/:pluginKey",async(req,res,next)=>{try{const data=await pluginPlatformService.get(String(req.params.pluginKey));if(!data)return res.status(404).json({success:false,message:"Plugin not found"});return res.json({success:true,data});}catch(e){return next(e);}});
export default router;
