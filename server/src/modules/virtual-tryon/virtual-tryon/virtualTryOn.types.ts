export interface CreateVirtualTryOnDto {
  userId: string;
  productId: string;
  personImage: string;
  garmentImage: string;
}

export interface VirtualTryOnResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
