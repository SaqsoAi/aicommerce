type Order = {
  id: string;
  address?: string;
  weight?: number;
  amount?: number;
};

export const courierEngine = {
  /**
   * Basic shipment creation
   */
  async createShipment(order: Order) {
    return {
      trackingCode: `TRK-${Date.now()}`,
      courier: "Pathao",
      status: "created",
      orderId: order.id,
      message: "Shipment created successfully",
    };
  },

  /**
   * Smart courier selection
   */
  selectCourier(order: Order): string {
    const weight = order.weight ?? 0;
    const amount = order.amount ?? 0;

    if (weight > 5) {
      return "RedX";
    }

    if (amount > 5000) {
      return "Steadfast";
    }

    return "Pathao";
  },

  /**
   * AI-ready shipment creation
   */
  async createSmartShipment(order: Order) {
    const courier =
      courierEngine.selectCourier(order);

    return {
      trackingCode: `TRK-${Date.now()}`,
      courier,
      status: "created",
      orderId: order.id,
      message: `Shipment created via ${courier}`,
    };
  },
};

/**
 * Legacy Compatibility Export
 * Required by existing controllers
 */
export const createShipment = async (
  order: Order
) => {
  return courierEngine.createShipment(order);
};