import api from "./client";

export type HomepageHero = {
  id?: string;
  type?: string;
  src?: string;
  desktopSrc?: string;
  mainSrc?: string;
  laptopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  headline?: string;
  subheadline?: string;
  alt?: string;
  altText?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  status?: string;
  active?: boolean;
  isActive?: boolean;
};

type HomepageHeroResponse = {
  success?: boolean;
  data?: HomepageHero[] | HomepageHero;
};

export async function getHomepageHeroes(): Promise<HomepageHero[]> {
  const res = await api.get<HomepageHeroResponse | HomepageHero[]>(
    "/homepage-hero"
  );

  const payload: any = res.data;

  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : payload?.data
        ? [payload.data]
        : [];

  return raw.filter((item: HomepageHero) => {
    if (!item) return false;
    if (item.status && item.status !== "active") return false;
    if (item.active === false) return false;
    if (item.isActive === false) return false;
    return true;
  });
}
