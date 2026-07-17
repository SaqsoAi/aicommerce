export type CreatePurchaseOrderPayload = {
  supplierId: string;

  notes?: string;

  items: {
    productId: string;
    quantity: number;
    costPrice: number;
  }[];
};