export function predictiveIntelligence(input: {
  historicalRevenue?: number[];
  historicalUnits?: number[];
  activeCustomers?: number;
  repeatCustomers?: number;
  stockUnits?: number;
  averageDailyUnits?: number;
}) {
  const revenue = input.historicalRevenue ?? [];
  const units = input.historicalUnits ?? [];
  const average = (values: number[]) =>
    values.length
      ? values.reduce((sum, value) => sum + Number(value), 0) / values.length
      : 0;

  const revenueAverage = average(revenue);
  const unitAverage = average(units);
  const repeatRate = Number(input.activeCustomers ?? 0)
    ? Number(input.repeatCustomers ?? 0) / Number(input.activeCustomers)
    : 0;
  const daysToStockout = Number(input.averageDailyUnits ?? 0)
    ? Number(input.stockUnits ?? 0) / Number(input.averageDailyUnits)
    : null;

  return {
    nextPeriodRevenue: {
      conservative: revenueAverage * 0.85,
      expected: revenueAverage,
      aggressive: revenueAverage * 1.18,
    },
    nextPeriodUnits: {
      conservative: unitAverage * 0.88,
      expected: unitAverage,
      aggressive: unitAverage * 1.15,
    },
    churnRisk: Math.max(0, Math.min(1, 1 - repeatRate)),
    daysToStockout,
    confidence: revenue.length >= 6 ? 0.81 : 0.55,
    methodology: "Moving-average baseline with bounded business scenarios.",
  };
}
