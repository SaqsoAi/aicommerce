export type SizeFitCenterSettingsInput = {
  heroJson?: unknown | undefined;
  statsJson?: unknown | undefined;
  menuJson?: unknown | undefined;
  sizeGuideJson?: unknown | undefined;
  fitGuideJson?: unknown | undefined;
  measurementJson?: unknown | undefined;
  guaranteeJson?: unknown | undefined;
  helpJson?: unknown | undefined;
  ctaJson?: unknown | undefined;
  reviewSettingsJson?: unknown | undefined;
  layoutJson?: unknown | undefined;
  active?: boolean | undefined;
};

export type FitReviewInput = {
  rating: number;
  comment?: string | null | undefined;
  productId: string;
  userId: string;
  fitRating?: string | null | undefined;
  bodyType?: string | null | undefined;
  heightCm?: number | null | undefined;
  weightKg?: number | null | undefined;
  sizeOrdered?: string | null | undefined;
  reviewImages?: unknown | undefined;
};
