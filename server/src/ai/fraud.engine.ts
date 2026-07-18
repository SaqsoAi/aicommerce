type FraudInput = {
  orderAmount: number;
  orderCount: number;
  locationMismatch: boolean;
};

export const fraudEngine = {
  /**
   * Basic fraud scoring system
   */
  calculateScore: ({
    orderAmount,
    orderCount,
    locationMismatch,
  }: FraudInput) => {
    let score = 0;

    if (orderAmount > 15000) score += 30;

    if (orderCount > 5) score += 40;

    if (locationMismatch) score += 50;

    return {
      score,
      risk:
        score > 70
          ? "HIGH"
          : score > 40
          ? "MEDIUM"
          : "LOW",
    };
  },

  /**
   * Advanced fraud detection (AI-ready version)
   */
  detect: (data: FraudInput & { ipRisk?: number }) => {
    let score = 0;

    if (data.orderAmount > 15000) score += 25;
    if (data.orderCount > 5) score += 35;
    if (data.locationMismatch) score += 40;
    if (data.ipRisk && data.ipRisk > 50) score += 30;

    const risk =
      score > 80
        ? "HIGH"
        : score > 50
        ? "MEDIUM"
        : "LOW";

    return {
      score,
      risk,
      approved: risk !== "HIGH",
    };
  },
};