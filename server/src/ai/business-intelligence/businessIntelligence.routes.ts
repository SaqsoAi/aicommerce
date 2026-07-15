import { Router } from "express";
import { aiBusinessIntelligenceService } from "./businessIntelligence.service";
import { businessAiControlService } from "./control.service";

const router=Router();

function context(req:any){
  const user=req.user??{};
  return {
    userId:String(user.id??user.userId??"anonymous"),
    role:String(user.role??"ADMIN"),
    tenantId:user.tenantId?String(user.tenantId):undefined,
    storeId:user.storeId?String(user.storeId):undefined,
  };
}

router.get("/health",(_req,res)=>res.json({success:true,module:"saqso-business-ai-advisor",version:"1.4.0",realData:true,multilingual:true,liveMutation:false}));
router.get("/snapshot",async(req,res,next)=>{try{res.json({success:true,data:await aiBusinessIntelligenceService.snapshot(context(req),Number(req.query.days??30))});}catch(e){next(e);}});
router.post("/chat",async(req,res,next)=>{try{res.json({success:true,data:await aiBusinessIntelligenceService.chat(context(req),req.body??{})});}catch(e){next(e);}});
router.get("/ceo-report",async(req,res,next)=>{try{res.json({success:true,data:await aiBusinessIntelligenceService.ceoReport(context(req),Number(req.query.days??30))});}catch(e){next(e);}});
router.post("/sales-goal-plan",async(req,res,next)=>{try{res.json({success:true,data:await aiBusinessIntelligenceService.chat(context(req),{...req.body,message:req.body?.message??"Create a sales target and budget plan"})});}catch(e){next(e);}});

router.post("/task-draft",(req,res)=>{const action=req.body?.action;if(!action)return res.status(400).json({success:false,error:{code:"ACTION_REQUIRED",message:"Business action is required"}});return res.json({success:true,data:{title:action.title,description:action.description,owner:action.owner,priority:action.priority,dueInDays:action.dueInDays,source:"BUSINESS_AI",approvalRequired:true,metadata:{businessActionId:action.id,conversationId:req.body?.conversationId}}});});

router.get("/platform/control",async(req:any,res,next)=>{try{if(String(req.user?.role)!=="SUPER_ADMIN")return res.status(403).json({success:false,error:{code:"PLATFORM_ADMIN_REQUIRED"}});res.json({success:true,data:await businessAiControlService.get(String(req.query.tenantId??""),String(req.query.storeId??"")||undefined)});}catch(e){next(e);}});
router.post("/platform/control",async(req:any,res,next)=>{try{if(String(req.user?.role)!=="SUPER_ADMIN")return res.status(403).json({success:false,error:{code:"PLATFORM_ADMIN_REQUIRED"}});res.json({success:true,data:await businessAiControlService.save(req.body)});}catch(e){next(e);}});

export default router;
