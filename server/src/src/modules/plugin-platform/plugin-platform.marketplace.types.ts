export type MarketplaceTrustDecision =
  | "TRUSTED"
  | "TRUSTED_WITH_WARNING"
  | "UNTRUSTED"
  | "REVOKED"
  | "UNSUPPORTED"
  | "INCOMPATIBLE";

export interface MarketplaceTrustEvaluation {
  decision: MarketplaceTrustDecision;
  installAllowed: boolean;
  signatureValid: boolean;
  packageHashValid: boolean;
  repositoryTrusted: boolean;
  vendorTrusted: boolean;
  signingKeyTrusted: boolean;
  compatible: boolean;
  reasons: string[];
}
