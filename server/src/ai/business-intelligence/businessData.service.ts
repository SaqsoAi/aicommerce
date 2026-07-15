import prisma from "../../config/prisma";
import type { TenantBusinessContext } from "./businessAdvisor.types";

function dateFrom(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.max(1, Math.min(days, 365)));
  return d;
}

export async function loadBusinessSnapshot(
  context: TenantBusinessContext,
  periodDays = 30,
) {
  const since = dateFrom(periodDays);

  // Phase G ownership fields are optional during transition. The service never trusts
  // tenant/store values supplied by the chat body; context must come from authenticated user.
  const orderWhere: Record<string, unknown> = { createdAt: { gte: since } };
  const productWhere: Record<string, unknown> = {};

  const [orders, products, cart, wishlist, reviews, campaigns, customers] =
    await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        include: { items: { include: { product: true } }, user: true },
        orderBy: { createdAt: "desc" },
        take: 5000,
      }),
      prisma.product.findMany({
        where: productWhere,
        include: { variants: true, reviews: true },
        take: 5000,
      }),
      prisma.cart.findMany({ include: { product: true }, take: 5000 }),
      prisma.wishlist.findMany({ include: { product: true }, take: 5000 }),
      prisma.review.findMany({ include: { product: true }, take: 5000 }),
      prisma.campaign.findMany({ take: 1000 }),
      prisma.user.findMany({ take: 5000 }),
    ]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.finalAmount ?? order.totalAmount ?? 0), 0);
  const units = orders.flatMap((order) => order.items).reduce((sum, item) => sum + item.quantity, 0);
  const productSales = new Map<string, number>();
  for (const item of orders.flatMap((order) => order.items)) {
    productSales.set(item.productId, (productSales.get(item.productId) ?? 0) + item.quantity);
  }

  return {
    context: { ...context, tenantIsolationMode: context.tenantId ? "AUTH_CONTEXT" : "TRANSITIONAL" },
    periodDays,
    generatedAt: new Date().toISOString(),
    kpis: {
      revenue,
      orders: orders.length,
      units,
      averageOrderValue: orders.length ? revenue / orders.length : 0,
      products: products.length,
      customers: customers.length,
      activeCampaigns: campaigns.filter((campaign) => campaign.active).length,
      cartUnits: cart.reduce((sum, item) => sum + item.quantity, 0),
      wishlistCount: wishlist.length,
    },
    orders,
    products,
    cart,
    wishlist,
    reviews,
    campaigns,
    productSales: Object.fromEntries(productSales),
  };
}
