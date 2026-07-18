import { Router } from "express";
import { aiProviderRegistry } from "../../ai/core/providerRegistry";
import { protect } from "../auth/auth.middleware";
import { requirePlatformAdmin } from "../../middleware/authorize.middleware";
import { compareDomSnapshots, compareScreenshots, mapLaravelSource } from "./migration-parity.service";
const router=Router();
router.use(protect);
router.use(...(requirePlatformAdmin as any));
const catalog=[
 {key:"chat",terms:["chat","assistant","copilot","agent"],endpoint:"/api/ai",type:"chat"},
 {key:"recommendation",terms:["recommendation","personalization","stylist"],endpoint:"/api/ai/personalization",type:"chat"},
 {key:"vision",terms:["visual-search","vision","try-on","tryon"],endpoint:"/api/ai/vision",type:"vision"},
 {key:"search",terms:["semantic search","embedding","rag"],endpoint:"/api/ai/search",type:"embedding"},
 {key:"voice",terms:["voice","speech"],endpoint:"/api/ai",type:"speech"},
 {key:"ocr",terms:["ocr"],endpoint:"/api/ai/vision",type:"ocr"},
 {key:"content",terms:["content","copywriter"],endpoint:"/api/ai/content-studio",type:"chat"},
 {key:"marketing",terms:["marketing","campaign ai"],endpoint:"/api/ai/marketing",type:"chat"},
 {key:"business-intelligence",terms:["forecast","insight","business intelligence"],endpoint:"/api/ai/business-intelligence",type:"chat"}
] as const;
router.get("/capabilities",(_req,res)=>res.json({success:true,data:{providers:aiProviderRegistry.list(),capabilities:catalog}}));
router.post("/reconcile-ai",(req,res)=>{const signals=Array.isArray(req.body?.signals)?req.body.signals.map((v:unknown)=>String(v).toLowerCase()):[];const providers=aiProviderRegistry.list();const data=signals.map((signal:string)=>{const match=catalog.find(c=>c.terms.some(t=>signal.includes(t)||t.includes(signal)));if(!match)return{signal,status:"IMPLEMENT_NEW",providers:providers.filter(p=>p.enabled).map(p=>p.name)};const available=providers.filter(p=>p.enabled&&p.supports.includes(match.type as any)).map(p=>p.name);return{signal,status:available.length?"REUSE_EXISTING":"IMPLEMENT_ADAPTER",capability:match.key,endpoint:match.endpoint,providers:available};});return res.json({success:true,data});});
router.post("/laravel/map",(req,res)=>res.json({success:true,data:mapLaravelSource(req.body??{})}));
router.post("/parity/dom",(req,res)=>res.json({success:true,data:compareDomSnapshots(Array.isArray(req.body?.source)?req.body.source:[],Array.isArray(req.body?.target)?req.body.target:[])}));
router.post("/parity/pixel",async(req,res,next)=>{try{return res.json({success:true,data:await compareScreenshots(req.body?.source,req.body?.target)});}catch(error){return next(error);}});
router.post("/certify",(req,res)=>{const keys=["clientBuild","serverBuild","adminBuild","apiSmoke","tenantIsolation","pixelParity","domParity","computedStyleParity","adminCrud","aiReconciliation"];const failed=keys.filter(k=>req.body?.gates?.[k]!=="PASS");return res.status(failed.length?409:200).json({success:!failed.length,data:{status:failed.length?"BLOCKED":"CERTIFIED",failed,publishReady:!failed.length}});});
export default router;
