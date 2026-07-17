type Order = {
  amount: number;
  quantity: number;
  locationMismatch?: boolean;
};

export const fraudEngine = {
  /**
   * Basic fraud scoring
   */
  calculate: (order: Order) => {
    let score = 0;

    if (order.amount > 20000) score += 40;
    if (order.quantity > 5) score += 30;
    if (order.locationMismatch) score += 50;

    const risk =
      score > 70
        ? "HIGH"
        : score > 40
        ? "MEDIUM"
        : "LOW";

    return {
      score,
      risk,
    };
  },

  /**
   * AI explainable fraud detection
   */
  detect: (order: Order) => {
    const reasons: string[] = [];
    let score = 0;

    if (order.amount > 20000) {
      score += 40;
      reasons.push("High order amount");
    }

    if (order.quantity > 5) {
      score += 30;
      reasons.push("Bulk quantity detected");
    }

    if (order.locationMismatch) {
      score += 50;
      reasons.push("Location mismatch detected");
    }

    const risk =
      score > 70
        ? "HIGH"
        : score > 40
        ? "MEDIUM"
        : "LOW";

    return {
      score,
      risk,
      reasons,
      approved: risk !== "HIGH",
    };
  },
};