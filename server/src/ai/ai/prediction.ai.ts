type SalesInput = number[];

export const predictionAI = {
  predictSales: (sales: SalesInput) => {
    const safeSales = Array.isArray(sales)
      ? sales.filter((n) => typeof n === "number")
      : [];

    if (safeSales.length === 0) {
      return {
        nextWeek: 0,
        trend: "NO_DATA",
        confidence: 0,
      };
    }

    const first = safeSales[0] ?? 0;
    const last =
      safeSales[safeSales.length - 1] ?? 0;

    const avg =
      safeSales.reduce((a, b) => a + b, 0) /
      safeSales.length;

    const growth = (last - first) / (first || 1);

    return {
      nextWeek: avg * 1.2,
      trend: growth >= 0 ? "UP" : "DOWN",
      confidence: Math.min(
        Math.abs(growth * 100),
        100
      ),
    };
  },

  predictAdvanced: (sales: SalesInput) => {
    const safeSales = Array.isArray(sales)
      ? sales.filter((n) => typeof n === "number")
      : [];

    if (safeSales.length === 0) {
      return {
        nextWeek: 0,
        trend: "NO_DATA",
        confidence: 0,
        volatility: 0,
      };
    }

    const first = safeSales[0] ?? 0;
    const last =
      safeSales[safeSales.length - 1] ?? 0;

    const avg =
      safeSales.reduce((a, b) => a + b, 0) /
      safeSales.length;

    const growth = (last - first) / (first || 1);

    const variance =
      safeSales.reduce((acc, val) => {
        return acc + Math.pow(val - avg, 2);
      }, 0) / safeSales.length;

    const volatility = Math.sqrt(variance);

    return {
      nextWeek: avg * (1 + Math.abs(growth)),
      trend: growth >= 0 ? "UP" : "DOWN",
      confidence: Math.min(
        Math.abs(growth * 100),
        100
      ),
      volatility,
    };
  },
};