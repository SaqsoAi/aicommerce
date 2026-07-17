export type ThemeScope =
  | "ADMIN"
  | "CLIENT"
  | "ROLE"
  | "SECTION";

export type EnterpriseThemePayload = {
  scope: ThemeScope;
  role?: string;
  key: string;
  value: Record<string, any>;
  active?: boolean;
};
