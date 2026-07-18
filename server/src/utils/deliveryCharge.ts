export const calculateDeliveryCharge =
  (district: string) => {
    if (district === "Dhaka") {
      return 60;
    }

    return 120;
  };