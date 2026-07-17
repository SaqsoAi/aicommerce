type GoalInput = {
  targetUnits?: number;
  targetRevenue?: number;
  budget?: number;
  currentUnits?: number;
  currentRevenue?: number;
  weeks?: number;
};

export function enterpriseGoalPlan(input: GoalInput) {
  const weeks = Math.max(1, Number(input.weeks ?? 4));
  const targetUnits = Number(input.targetUnits ?? 0);
  const targetRevenue = Number(input.targetRevenue ?? 0);
  const budget = Number(input.budget ?? 0);
  const unitGap = Math.max(0, targetUnits - Number(input.currentUnits ?? 0));
  const revenueGap = Math.max(0, targetRevenue - Number(input.currentRevenue ?? 0));

  return {
    targets: {targetUnits, targetRevenue, budget},
    gaps: {unitGap, revenueGap},
    weeklyPlan: Array.from({length:weeks}, (_,index) => ({
      week: index + 1,
      unitsTarget: Math.ceil(unitGap / weeks),
      revenueTarget: Math.ceil(revenueGap / weeks),
      budget: Math.ceil(budget / weeks),
      focus: index === 0
        ? "Validate product, inventory and audience readiness."
        : index === weeks - 1
          ? "Scale winners and recover remaining gap."
          : "Execute, measure and optimize.",
    })),
    approvalRequired: true,
  };
}
