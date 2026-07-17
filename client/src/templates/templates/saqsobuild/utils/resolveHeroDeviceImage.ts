export type HeroDeviceKey = "desktop" | "laptop" | "tablet" | "mobile";

export type DeviceHeroImage = {
  src?: string | null;
  desktopSrc?: string | null;
  laptopSrc?: string | null;
  tabletSrc?: string | null;
  mobileSrc?: string | null;
};

export function getHeroDevice(width = typeof window !== "undefined" ? window.innerWidth : 1440): HeroDeviceKey {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1440) return "laptop";
  return "desktop";
}

export function resolveHeroDeviceImage(hero: DeviceHeroImage, device: HeroDeviceKey = getHeroDevice()) {
  if (device === "desktop") {
    return hero.desktopSrc || hero.laptopSrc || hero.tabletSrc || hero.mobileSrc || hero.src || "";
  }

  if (device === "laptop") {
    return hero.laptopSrc || hero.desktopSrc || hero.tabletSrc || hero.mobileSrc || hero.src || "";
  }

  if (device === "tablet") {
    return hero.tabletSrc || hero.mobileSrc || hero.laptopSrc || hero.desktopSrc || hero.src || "";
  }

  return hero.mobileSrc || hero.tabletSrc || hero.laptopSrc || hero.desktopSrc || hero.src || "";
}

export function getHeroDeviceObjectPosition(device: HeroDeviceKey) {
  if (device === "mobile") return "50% 50%";
  if (device === "tablet") return "50% 48%";
  if (device === "laptop") return "50% 50%";
  return "50% 50%";
}