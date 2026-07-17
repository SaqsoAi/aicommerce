export type LandingStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export type LandingSectionInput = {
  id?: string | undefined;
  type: string;
  title?: string | null | undefined;
  subtitle?: string | null | undefined;
  sortOrder?: number | undefined;
  configJson?: unknown;
};

export type LandingPageInput = {
  name: string;
  slug: string;
  campaignId?: string | null | undefined;
  title: string;
  description?: string | null | undefined;
  seoTitle?: string | null | undefined;
  seoDescription?: string | null | undefined;
  seoKeywords?: string | null | undefined;
  template?: string | undefined;
  status?: LandingStatus | undefined;
  isPublished?: boolean | undefined;
  sections?: LandingSectionInput[] | undefined;
};
