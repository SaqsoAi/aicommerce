export type InventoryItem = {
  id: string;

  color: string;

  size: string;

  stock: number;

  reservedStock: number;

  availableStock: number;

  lowStockThreshold: number;

  sku: string;

  product: {
    id: string;
    name: string;
  };
};