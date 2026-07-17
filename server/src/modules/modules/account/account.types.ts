export type AccountAction = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  icon?: string;
  count?: number;
};

export type AccountWidget = {
  key: string;
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
};

export type AccountDashboard = {
  profile: Record<string, unknown> | null;
  membership: Record<string, unknown> | null;
  rewards: {
    balance: number;
    ledger: Array<Record<string, unknown>>;
  };
  widgets: AccountWidget[];
  quickActions: AccountAction[];
  recentOrders: Array<Record<string, unknown>>;
  wishlist: Array<Record<string, unknown>>;
  recommendations: Array<Record<string, unknown>>;
  dbReady: boolean;
};