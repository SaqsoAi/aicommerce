import type { BusinessAction, BusinessEvidence } from "./businessAdvisor.types";

export function analyzeSales(snapshot: any) {
  const { kpis } = snapshot;
  const evidence: BusinessEvidence[] = [
    { key: "revenue", label: "Revenue", value: Number(kpis.revenue.toFixed(2)), source: "Order.finalAmount", period: `${snapshot.periodDays} days` },
    { key: "orders", label: "Orders", value: kpis.orders, source: "Order", period: `${snapshot.periodDays} days` },
    { key: "units", label: "Units sold", value: kpis.units, source: "OrderItem.quantity", period: `${snapshot.periodDays} days` },
    { key: "aov", label: "Average order value", value: Number(kpis.averageOrderValue.toFixed(2)), source: "Order aggregate" },
    { key: "cart", label: "Units waiting in cart", value: kpis.cartUnits, source: "Cart.quantity" },
    { key: "wishlist", label: "Wishlist demand", value: kpis.wishlistCount, source: "Wishlist" },
  ];

  const causes:string[] = [];
  if (kpis.units === 0) causes.push("No completed product demand was recorded in the selected period.");
  if (kpis.cartUnits > kpis.units * 0.25) causes.push("A meaningful share of demand is stuck in cart and needs retargeting.");
  if (kpis.activeCampaigns === 0) causes.push("There is no active campaign supporting current demand.");
  if (kpis.averageOrderValue < 1000) causes.push("Average order value is low; bundles and threshold offers may help.");

  return { evidence, causes };
}

export function analyzeProducts(snapshot: any) {
  const sales = snapshot.productSales as Record<string,number>;
  const cartCount = new Map<string,number>();
  const wishlistCount = new Map<string,number>();
  snapshot.cart.forEach((x:any)=>cartCount.set(x.productId,(cartCount.get(x.productId)??0)+x.quantity));
  snapshot.wishlist.forEach((x:any)=>wishlistCount.set(x.productId,(wishlistCount.get(x.productId)??0)+1));

  return snapshot.products.map((p:any)=>{
    const stock=p.variants.reduce((s:number,v:any)=>s+Number(v.availableStock ?? v.stock ?? 0),0);
    const sold=sales[p.id]??0;
    const cart=cartCount.get(p.id)??0;
    const wish=wishlistCount.get(p.id)??0;
    const pressure=stock > 0 ? sold / stock : sold;
    const score = sold*5 + cart*2 + wish - Math.min(stock,100)*0.1;
    return {
      productId:p.id, name:p.name, sku:p.sku, sold, stock, cart, wishlist:wish,
      rating:p.reviews.length ? p.reviews.reduce((s:number,r:any)=>s+r.rating,0)/p.reviews.length : 0,
      score:Number(score.toFixed(2)),
      classification:sold===0 && stock>0 ? "NOT_SELLING" : pressure<0.05 && stock>20 ? "SLOW" : "HEALTHY",
    };
  }).sort((a:any,b:any)=>a.score-b.score);
}

export function analyzeCustomers(snapshot:any) {
  const byUser=new Map<string,{orders:number,revenue:number,last?:Date}>();
  for(const order of snapshot.orders){
    const row=byUser.get(order.userId)??{orders:0,revenue:0};
    row.orders += 1;
    row.revenue += Number(order.finalAmount ?? order.totalAmount ?? 0);
    const created=new Date(order.createdAt);
    if(!row.last || created>row.last) row.last=created;
    byUser.set(order.userId,row);
  }
  const rows=[...byUser.entries()].map(([userId,v])=>({userId,...v}));
  return {
    activeBuyers:rows.length,
    repeatBuyers:rows.filter(x=>x.orders>1).length,
    highValue:rows.filter(x=>x.revenue>=5000).sort((a,b)=>b.revenue-a.revenue).slice(0,20),
  };
}

export function recoveryActions(products:any[]): BusinessAction[] {
  return products.slice(0,8).map((p,index)=>({
    id:`product-recovery-${p.productId}`,
    title:`Recover ${p.name}`,
    description:`Test primary image and offer, retarget ${p.cart} cart and ${p.wishlist} wishlist signals, and verify size/stock coverage (${p.stock} units).`,
    owner:index%2===0?"MARKETING":"MANAGER",
    priority:p.classification==="NOT_SELLING"?"HIGH":"MEDIUM",
    dueInDays:Math.min(7,index+2),
    expectedImpact:"Track product CTR, add-to-cart rate, conversion and units sold for seven days.",
    approvalRequired:true,
  }));
}
