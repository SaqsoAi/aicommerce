export type InventoryAdjustPayload = {
  variantId: string;

  adjustmentType:
    | "ADD"
    | "REMOVE";

  quantity: number;

  reason?: string;
};