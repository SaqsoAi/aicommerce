export type TemplateConfig = {
  heroStyle: "carousel" | "video" | "static";
  productLayout: "grid-2" | "grid-4" | "list";

  bannerEnabled: boolean;

  sections: {
    hero: boolean;
    categories: boolean;
    products: boolean;
  };
};