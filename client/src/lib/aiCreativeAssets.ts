export interface ApprovedCreativeAsset {
  id: string;
  kind: string;
  url: string;
  alt: string;
  approvalStatus: "approved" | "published";
}

export function onlyApprovedCreativeAssets<T extends ApprovedCreativeAsset>(assets: T[] | undefined | null): T[] {
  return Array.isArray(assets) ? assets.filter((asset) => asset.approvalStatus === "approved" || asset.approvalStatus === "published") : [];
}
