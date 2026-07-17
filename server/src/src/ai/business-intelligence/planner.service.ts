export function buildGoalPlan(snapshot:any,targetUnits:number,budget:number){
  const currentUnits=Number(snapshot.kpis.units||0);
  const periodDays=Number(snapshot.periodDays||30);
  const dailyBaseline=currentUnits/periodDays;
  const requiredDaily=targetUnits/periodDays;
  const gap=Math.max(0,targetUnits-currentUnits);
  const channels=[
    ["Meta prospecting",0.30],["Meta retargeting",0.18],["Google Search / Shopping",0.18],
    ["TikTok / short video",0.10],["Influencer / affiliate",0.10],
    ["SMS / WhatsApp / Email",0.06],["Creative test reserve",0.08],
  ].map(([channel,ratio])=>({channel,budget:Math.round(budget*Number(ratio))}));
  return {
    objective:{targetUnits,budget,periodDays,currentUnits,gap,requiredDaily:Number(requiredDaily.toFixed(2)),dailyBaseline:Number(dailyBaseline.toFixed(2))},
    inventory:{minimumRequired:targetUnits,knownAvailable:snapshot.products.reduce((s:number,p:any)=>s+p.variants.reduce((x:number,v:any)=>x+Number(v.availableStock??v.stock??0),0),0)},
    channels,
    weeklyPlan:[
      {week:1,focus:"Creative and offer tests",budgetShare:0.25,kpi:"CTR, add-to-cart, cost per landing-page view"},
      {week:2,focus:"Scale winning products",budgetShare:0.30,kpi:"Cost per order and units per order"},
      {week:3,focus:"Retarget cart, wishlist and product viewers",budgetShare:0.25,kpi:"Conversion and recovered carts"},
      {week:4,focus:"Urgency, bundles and retention",budgetShare:0.20,kpi:"Target completion and repeat purchase"},
    ],
    guardrails:[
      "Expected results are scenarios, not guarantees.",
      "Do not scale a product without verified inventory and margin.",
      "Approve every campaign and budget action before execution.",
    ],
  };
}

export function buildMarketingPlan(snapshot:any){
  const slow=snapshot.products.filter((p:any)=>(snapshot.productSales[p.id]??0)===0).slice(0,5);
  return {
    campaignName:"Business AI Recovery Campaign",
    segments:["Cart abandoners","Wishlist users","Recent buyers","High-value customers"],
    products:slow.map((p:any)=>({id:p.id,name:p.name,offer:"Test bundle or controlled incentive"})),
    channels:["Meta","Google","TikTok","SMS","WhatsApp","Email"],
    measurement:["Reach","CTR","Add to cart","Cost per order","Units sold","Gross margin"],
  };
}
