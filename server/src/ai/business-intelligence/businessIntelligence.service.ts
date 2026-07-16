import { aiGateway } from "../core/gateway";
import { detectBusinessIntent, detectBusinessLanguage } from "./language";
import { loadBusinessSnapshot } from "./businessData.service";
import { analyzeCustomers, analyzeProducts, analyzeSales, recoveryActions } from "./intelligence.service";
import { buildGoalPlan, buildMarketingPlan } from "./planner.service";
import type { BusinessAdvisorAnswer, BusinessChatRequest, TenantBusinessContext } from "./businessAdvisor.types";

function money(value:number){ return new Intl.NumberFormat("en-BD",{maximumFractionDigits:0}).format(value); }

export const aiBusinessIntelligenceService = {
  async snapshot(context:TenantBusinessContext,days=30){
    return loadBusinessSnapshot(context,days);
  },

  async chat(context:TenantBusinessContext,input:BusinessChatRequest):Promise<BusinessAdvisorAnswer>{
    const language=detectBusinessLanguage(input.message);
    const intent=detectBusinessIntent(input.message);
    const snapshot=await loadBusinessSnapshot(context,input.periodDays??30);
    const sales=analyzeSales(snapshot);
    const products=analyzeProducts(snapshot);
    const customers=analyzeCustomers(snapshot);
    let headline="Business AI analysis";
    let directAnswer="";
    let actions:any[]=[];
    let printablePlan:any=undefined;

    if(intent==="PRODUCT_PERFORMANCE"){
      const weak=products.filter((p:any)=>p.classification!=="HEALTHY").slice(0,10);
      headline=`${weak.length} products need attention`;
      directAnswer=weak.length
        ? `The weakest products are ${weak.slice(0,3).map((p:any)=>p.name).join(", ")}. They have stock but weak recent sales.`
        : "No clear non-selling product was detected in the selected period.";
      actions=recoveryActions(weak);
    } else if(intent==="SALES_GOAL_PLAN"){
      const target=Number(input.targetUnits||20000);
      const budget=Number(input.budget||500000);
      printablePlan=buildGoalPlan(snapshot,target,budget);
      headline=`Plan for ${target.toLocaleString()} units`;
      directAnswer=`Current selected-period sales are ${snapshot.kpis.units} units. The plan must close a gap of ${Math.max(0,target-snapshot.kpis.units).toLocaleString()} units using a budget of BDT ${money(budget)}.`;
      actions=printablePlan.weeklyPlan.map((w:any)=>({id:`week-${w.week}`,title:`Week ${w.week}: ${w.focus}`,description:`Budget share ${Math.round(w.budgetShare*100)}%. KPI: ${w.kpi}`,owner:"MARKETING",priority:"HIGH",dueInDays:w.week*7,estimatedBudget:Math.round(budget*w.budgetShare),approvalRequired:true}));
    } else if(intent==="CUSTOMER_INTELLIGENCE"){
      headline="Customer retention analysis";
      directAnswer=`There are ${customers.activeBuyers} active buyers and ${customers.repeatBuyers} repeat buyers in the selected period. Focus retention on first-time and high-value buyers.`;
      actions=[{id:"customer-retention",title:"Launch retention journey",description:"Segment first-time, repeat and high-value customers; create post-purchase, replenishment and win-back messages.",owner:"MARKETING",priority:"HIGH",dueInDays:5,approvalRequired:true}];
    } else if(intent==="MARKETING_PLAN"){
      printablePlan=buildMarketingPlan(snapshot);
      headline="Marketing execution plan";
      directAnswer=`Use active demand signals from ${snapshot.kpis.cartUnits} cart units and ${snapshot.kpis.wishlistCount} wishlist entries before increasing cold-audience spend.`;
      actions=[{id:"marketing-plan",title:"Approve campaign plan",description:"Prepare creative, audience, product offer and channel budget for approval.",owner:"MARKETING",priority:"HIGH",dueInDays:3,approvalRequired:true}];
    } else {
      headline="Sales and store-health diagnosis";
      directAnswer=sales.causes.length ? sales.causes.join(" ") : `Revenue is BDT ${money(snapshot.kpis.revenue)} from ${snapshot.kpis.orders} orders and ${snapshot.kpis.units} units in the selected period.`;
      actions=[{id:"sales-review",title:"Review sales funnel",description:"Compare product views, cart, wishlist, checkout, orders, inventory and active campaigns.",owner:"MANAGER",priority:"HIGH",dueInDays:3,approvalRequired:false}];
    }

    const providerResult = await aiGateway.execute<any>({
      feature:"business_ai_advisor",
      modelType:"chat",
      input:{
        instruction:input.message,
        language,
        intent,
        verifiedEvidence:{kpis:snapshot.kpis,sales:sales.evidence,topProducts:products.slice(0,15),customers},
        deterministicAnswer:{headline,directAnswer,actions,printablePlan},
        rules:["Use only supplied evidence","Clearly label estimates","Do not invent product/customer values","Return actionable concise advice"]
      },
      actor:{userId:context.userId,tenantId:context.tenantId},
      metadata:{tenantId:context.tenantId,storeId:context.storeId,evidenceBacked:true,noLiveMutation:true}
    }).catch(()=>null);
    const providerText = providerResult?.output && typeof providerResult.output==="object"
      ? String((providerResult.output as any).text??"").trim()
      : String(providerResult?.output??"").trim();

    return {
      intent,language,headline,directAnswer:providerText||directAnswer,confidence:snapshot.context.tenantIsolationMode==="AUTH_CONTEXT"?0.86:0.62,
      provider:providerResult?{name:providerResult.provider,model:providerResult.model,status:providerResult.status,auditId:providerResult.auditId}:undefined,
      evidence:sales.evidence,
      actions,
      risks:["Historical performance does not guarantee future results.","Verify inventory, contribution margin and operational capacity before execution."],
      assumptions:["The selected period and available commerce records are representative.","External ad-platform performance is not included unless separately connected."],
      printablePlan,
    };
  },

  async ceoReport(context:TenantBusinessContext,days=30){
    const snapshot=await loadBusinessSnapshot(context,days);
    const products=analyzeProducts(snapshot);
    const customers=analyzeCustomers(snapshot);
    return {
      title:"SAQSO Business AI — CEO Report",
      generatedAt:new Date().toISOString(),
      periodDays:days,
      kpis:snapshot.kpis,
      risks:products.filter((p:any)=>p.classification!=="HEALTHY").slice(0,10),
      customers,
      recommendations:recoveryActions(products.filter((p:any)=>p.classification!=="HEALTHY")),
      methodology:["Order and order-item aggregation","Product inventory and demand signals","Cart and wishlist signals","Customer order-frequency analysis"],
    };
  },
};
