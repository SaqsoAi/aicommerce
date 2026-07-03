"use client";

import { useEffect, useState } from "react";
import { getBrandingSettings } from "./branding.service";

export function useBranding() {
  const [branding, setBranding] = useState({
    brandName: "SAQSO",
    brandShortName: "SQ",
    brandSlogan: "",
    adminLogo: "",
    clientLogo: ""
  });

  useEffect(() => {
    getBrandingSettings().then(setBranding);
  }, []);

  return branding;
}
