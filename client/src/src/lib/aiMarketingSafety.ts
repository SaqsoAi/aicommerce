export type CustomerCampaignVisibility = {
  approved: boolean;
  consentGranted?: boolean;
  channel?: string;
};

export function canDisplayApprovedCampaign(campaign: CustomerCampaignVisibility): boolean {
  return Boolean(campaign.approved && campaign.consentGranted !== false);
}

export const AI_MARKETING_CLIENT_RULES = {
  clientDisplaysApprovedOnly: true,
  promptsNeverExposed: true,
  humanApprovalRequired: true,
};