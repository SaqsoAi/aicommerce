import prisma from "../../config/prisma";

type InventoryAnalyticsVariant = {
  stock?: number | null;
  price?: number | null;
  lowStockThreshold?: number | null;
  product?: unknown;
};

export const getInventoryAnalyticsService = async () => {
  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
    },
  });

  const totalVariants = variants.length;

  const totalStock = variants.reduce(
    (sum: number, item: InventoryAnalyticsVariant) =>
      sum + Number(item.stock ?? 0),
    0
  );

  const totalValue = variants.reduce(
    (sum: number, item: InventoryAnalyticsVariant) =>
      sum + Number(item.stock ?? 0) * Number(item.price ?? 0),
    0
  );

  const lowStock = variants.filter(
    (item: InventoryAnalyticsVariant) =>
      Number(item.stock ?? 0) <= Number(item.lowStockThreshold ?? 5)
  ).length;

  const outOfStock = variants.filter(
    (item: InventoryAnalyticsVariant) => Number(item.stock ?? 0) === 0
  ).length;

  const topProducts = [...variants]
    .sort(
      (a: InventoryAnalyticsVariant, b: InventoryAnalyticsVariant) =>
        Number(b.stock ?? 0) - Number(a.stock ?? 0)
    )
    .slice(0, 10);

  return {
    totalVariants,
    totalStock,
    totalValue,
    lowStock,
    outOfStock,
    topProducts,
  };
};