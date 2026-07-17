type Item = {
  category: string;
  price: number;
  quantity?: number;
};

export const offerEngine = {
  /**
   * Buy 1 Get 1 Offer
   */
  b1g1(
    quantity: number,
    price: number
  ): number {
    const payableQuantity =
      Math.ceil(quantity / 2);

    return payableQuantity * price;
  },

  /**
   * Combo Package Discount
   * Shirt + Pant + Belt = 20% OFF
   */
  packageDiscount(
    items: Item[],
    total: number
  ): number {
    const categories = items.map((item) =>
      item.category.toLowerCase()
    );

    const hasCombo =
      categories.includes("shirt") &&
      categories.includes("pant") &&
      categories.includes("belt");

    if (hasCombo) {
      return total * 0.8;
    }

    return total;
  },

  /**
   * Dynamic Discount
   */
  dynamicDiscount(
    total: number,
    discountPercent: number
  ): number {
    return (
      total -
      (total * discountPercent) / 100
    );
  },
};

/**
 * Legacy Compatibility Export
 */
export const applyB1G1 = (
  quantity: number,
  price: number
): number => {
  return offerEngine.b1g1(
    quantity,
    price
  );
};

/**
 * Legacy Compatibility Export
 */
export const packageDiscount = (
  items: Item[],
  total: number
): number => {
  return offerEngine.packageDiscount(
    items,
    total
  );
};