import type { HomepageSectionInstance } from "@/types/homepage-section";

export type HomepageTemplateKey = "fashion" | "luxury" | "modern" | "saqsobuild";
export type HomepageRuntimeSection = HomepageSectionInstance;
export type HomepageRuntimeMode = "published" | "preview";
export type HomepageRuntimeContext = { hostname: string; pathname: string; locale: string; mode: HomepageRuntimeMode; tenantId: string | null; storeId: string | null; publicationId: string | null; revisionId: string | null; };
export type HomepageRuntimeResult = { context: HomepageRuntimeContext; template: HomepageTemplateKey; sections: HomepageRuntimeSection[]; state: "ready" | "empty" | "api-error"; message?: string; };
