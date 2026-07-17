export const AI_MARKETING_CHANNELS = [
  { value: "email", label: "Email Marketing" },
  { value: "sms", label: "SMS Campaign" },
  { value: "whatsapp", label: "WhatsApp Marketing" },
  { value: "push", label: "Push Notification" },
  { value: "coupon", label: "Coupon Personalization" },
  { value: "journey", label: "Customer Journey" },
  { value: "calendar", label: "Marketing Calendar" },
] as const;

export const AI_MARKETING_APPROVAL_POLICY = [
  "Email -> Draft -> Approval -> Send",
  "SMS -> Draft -> Approval -> Send",
  "WhatsApp -> Draft -> Approval -> Send",
  "Push -> Draft -> Approval -> Publish",
  "Coupon -> Suggestion -> Approval -> Activate",
] as const;

export const AI_MARKETING_GOVERNANCE = {
  phase: "6.9",
  gatewayOnly: true,
  humanApprovalFirst: true,
  autoSendBlocked: true,
  autoPublishBlocked: true,
  pricingEngineProtected: true,
  consentRequired: true,
};