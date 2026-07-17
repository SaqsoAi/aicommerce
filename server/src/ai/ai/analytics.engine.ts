export const analyticsEngine = {
  salesForecast: (sales: number[]) => {
    if (!sales || sales.length === 0) {
      return {
        nextWeekForecast: 0,
        trend: "NO_DATA",
      };
    }

    const avg =
      sales.reduce((a: number, b: number) => a + b, 0) / sales.length;

    const trend =
      sales[0] !== undefined && avg > sales[0]
        ? "UP"
        : "DOWN";

    return {
      nextWeekForecast: avg * 1.15,
      trend,
    };
  },

  ctr: (clicks: number, views: number) => {
    if (!views) return 0;
    return (clicks / views) * 100;
  },

  performanceScore: (sales: number[], clicks: number, views: number) => {
    const avgSales =
      sales.reduce((a: number, b: number) => a + b, 0) / (sales.length || 1);

    const ctr = views ? (clicks / views) * 100 : 0;

    return {
      score: avgSales * 0.5 + ctr * 0.5,
    };
  },
};