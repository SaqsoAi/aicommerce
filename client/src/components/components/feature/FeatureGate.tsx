"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { PublicFeatureFlag, getPublicFeatureFlags } from "../../services/saas-foundation.api";

type FeatureGateProps = {
  featureKey: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export default function FeatureGate({ featureKey, fallback = null, children }: FeatureGateProps) {
  const [flags, setFlags] = useState<PublicFeatureFlag[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPublicFeatureFlags()
      .then((data) => setFlags(data.flags || []))
      .finally(() => setLoaded(true));
  }, []);

  const enabled = useMemo(() => {
    return flags.some((item) => item.key === featureKey && item.enabled);
  }, [flags, featureKey]);

  if (!loaded) return null;
  if (!enabled) return <>{fallback}</>;

  return <>{children}</>;
}