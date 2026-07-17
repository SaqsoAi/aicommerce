type ScenarioInput = {
  baselineRevenue?: number;
  baselineUnits?: number;
  budget?: number;
  conversionLiftPercent?: number;
  priceChangePercent?: number;
  stockAvailabilityPercent?: number;
};

function calculate(input: ScenarioInput, factor: number) {
  const revenue = Number(input.baselineRevenue ?? 0);
  const units = Number(input.baselineUnits ?? 0);
  const budget = Number(input.budget ?? 0);
  const conversion = Number(input.conversionLiftPercent ?? 0) / 100;
  const price = Number(input.priceChangePercent ?? 0) / 100;
  const stock = Number(input.stockAvailabilityPercent ?? 100) / 100;

  return {
    projectedRevenue:
      revenue * (1 + conversion * factor) * (1 + price) * stock
      + budget * 0.65 * factor,
    projectedUnits: units * (1 + conversion * factor) * stock,
    factor,
  };
}

export function enterpriseScenarioSimulation(input: ScenarioInput) {
  return {
    worstCase: calculate(input, 0.55),
    expectedCase: calculate(input, 1),
    bestCase: calculate(input, 1.35),
    assumptions: [
      "Budget efficiency is estimated.",
      "Inventory availability constrains achievable sales.",
      "External market shocks are not included.",
    ],
  };
}
