import prisma from "../../config/prisma";

export const fetchProductMasterService =
  async (
    barcode?: string,
    styleCode?: string
  ) => {
    // Future:
    // POS API
    // ERP API
    // Warehouse API

    if (
      barcode === "899001000001" ||
      styleCode === "NK-TS-000001"
    ) {
      return {
        found: true,

        source: "MOCK_POS",

        product: {
          name:
            "Nike Premium T-Shirt",

          brand: "Nike",

          category:
            "Fashion",

          subcategory:
            "T-Shirt",

          barcode:
            "899001000001",

          styleCode:
            "NK-TS-000001",

          price: 1200,

          variants: [
            {
              color: "Black",
              size: "M",
              qty: 15,
            },
            {
              color: "Black",
              size: "L",
              qty: 10,
            },
          ],
        },
      };
    }

    return {
      found: false,
    };
  };