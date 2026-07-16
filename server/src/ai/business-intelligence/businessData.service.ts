import prisma from "../../config/prisma";import type{TenantBusinessContext}from "./businessAdvisor.types";
function since(days:number){const d=new Date();d.setDate(d.getDate()-Math.max(1,Math.min(365,days)));return d;}
function scope(context:TenantBusinessContext){if(!context.tenantId)throw Object.assign(new Error("Authenticated tenant context required"),{code:"TENANT_CONTEXT_REQUIRED"});return {tenantId:context.tenantId,...(context.storeId?{storeId:context.storeId}:{})};}
export async function loadBusinessSnapshot(context:TenantBusinessContext,periodDays=30){const owned=scope(context);const createdAt={gte:since(periodDays)};const p:any=prisma;
const [orders,products,cart,wishlist,reviews,campaigns,customers]=await Promise.all([
 p.order.findMany({where:{...owned,createdAt},include:{items:{include:{product:true}},user:true},orderBy:{createdAt:"desc"},take:5000}),
 p.product.findMany({where:owned,include:{variants:true,reviews:true},take:5000}),
 p.cart.findMany({where:owned,include:{product:true},take:5000}),
 p.wishlist.findMany({where:owned,include:{product:true},take:5000}),
 p.review.findMany({where:owned,include:{product:true},take:5000}),
 p.campaign.findMany({where:owned,take:1000}),
 p.user.findMany({where:owned,take:5000})
]);const revenue=orders.reduce((s:any,o:any)=>s+Number(o.finalAmount??o.totalAmount??0),0);const units=orders.flatMap((o:any)=>o.items).reduce((s:number,i:any)=>s+i.quantity,0);
return {context:{...context,tenantIsolationMode:"ENFORCED"},periodDays,generatedAt:new Date().toISOString(),kpis:{revenue,orders:orders.length,units,averageOrderValue:orders.length?revenue/orders.length:0,products:products.length,customers:customers.length,activeCampaigns:campaigns.filter((x:any)=>x.active).length,cartUnits:cart.reduce((s:number,x:any)=>s+x.quantity,0),wishlistCount:wishlist.length},orders,products,cart,wishlist,reviews,campaigns,customers};}
