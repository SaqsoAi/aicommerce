"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  PublicAiFeature,
  getPublicAiAvailability,
} from "../../services/ai-control.api";

type AiFeatureGateProps = {
  featureKey: string;
  placement?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export default function AiFeatureGate({
  featureKey,
  placement,
  fallback = null,
  children,
}: AiFeatureGateProps) {
  const [features, setFeatures] = useState<PublicAiFeature[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPublicAiAvailability()
      .then((data) => setFeatures(data.features || []))
      .finally(() => setLoaded(true));
  }, []);

  const allowed = useMemo(() => {
    const feature = features.find((item) => item.key === featureKey && item.enabled);
    if (!feature) return false;
    if (!placement) return true;
    if (!Array.isArray(feature.placement)) return true;
    return feature.placement.includes(placement);
  }, [features, featureKey, placement]);

  if (!loaded) return null;
  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}