export type ProductVariantForm = {
  color: string;
  size: string;
  styleNo?: string;
  fabric?: string;
  occasion?: string;
  costPrice?: number;
  salesPrice?: number;
  stock: number;
  sku: string;
  barcode: string;
  price: number;
  availableStock?: number;
  lowStockThreshold?: number;
  reservedStock?: number;
  supplierSku?: string;
  warehouseLocation?: string;
};

export type ProductMetaRow = {
  name: string;
  groupName?: string;
  value: string;
};

export type ProductFormData = {
  name: string;
  groupName?: string;

  styleNo?: string;
  sku: string;
  barcode?: string;

  categoryId: string;
  subcategoryId?: string;
  brandId?: string;

  shortDescription?: string;
  description: string;

  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;

  price: number;
  discountPrice?: number;
  discountPercent?: number;

  featured?: boolean;
  trending?: boolean;
  status?: string;
  visibility?: string;
  condition?: string;
  approvalStatus?: string;
  approvalNote?: string;
  publishAt?: string;
  unpublishAt?: string;

  thumbnail?: string;
  videoUrl?: string;

  gallery?: any[];

  variants?: ProductVariantForm[];
  specifications?: ProductMetaRow[];
  attributes?: ProductMetaRow[];
};

export type ProductMasterResponse = {
  found: boolean;

  source?: string;

  product?: {
    name: string;
    groupName?: string;
    brand?: string;
    category?: string;
    subcategory?: string;
    barcode?: string;
    styleCode?: string;
    price?: number;

    variants?: {
      color: string;
      size: string;
      fabric?: string;
      occasion?: string;
      costPrice?: number;
      salesPrice?: number;
      qty: number;
    }[];
  };
};
