type SizeInput = {
  height: number;
  weight: number;
};

export const sizeRecommender = {
  /**
   * Basic size recommendation (weight-based baseline)
   */
  getSize: ({ height, weight }: SizeInput) => {
    // optional future use of height (kept for AI upgrade readiness)

    if (weight < 60) return "S";

    if (weight < 75) return "M";

    if (weight < 90) return "L";

    return "XL";
  },

  /**
   * Advanced AI-style recommendation (future-ready logic)
   */
  getSmartSize: ({ height, weight }: SizeInput) => {
    let score = weight;

    // height adjustment (future AI logic base)
    if (height > 180) score += 5;
    if (height < 160) score -= 5;

    if (score < 60) return "S";
    if (score < 75) return "M";
    if (score < 90) return "L";

    return "XL";
  },
};