export type CreativeAssetKind = "product_image" | "lifestyle_image" | "fashion_model" | "banner" | "poster" | "story" | "thumbnail" | "video_foundation";

export const creativeStudioKinds: { value: CreativeAssetKind; label: string }[] = [
  { value: "product_image", label: "Product Image Studio" },
  { value: "lifestyle_image", label: "Lifestyle Image Studio" },
  { value: "fashion_model", label: "Fashion Model Studio" },
  { value: "banner", label: "Banner Generator" },
  { value: "poster", label: "Poster Generator" },
  { value: "story", label: "Story Generator" },
  { value: "thumbnail", label: "Thumbnail Generator" },
  { value: "video_foundation", label: "Video Foundation" },
];

export const creativeGovernance = [
  "AI Gateway only",
  "Prompt Registry required",
  "Media Manager reused",
  "No original overwrite",
  "Admin approval before publish",
  "Generated asset provenance required",
];
