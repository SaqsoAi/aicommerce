export const calculateFraudRisk =
  (
    orderAmount: number,
    orderCount: number
  ) => {
    let risk = 0;

    if (orderAmount > 10000) {
      risk += 30;
    }

    if (orderCount > 5) {
      risk += 40;
    }

    return risk;
  };