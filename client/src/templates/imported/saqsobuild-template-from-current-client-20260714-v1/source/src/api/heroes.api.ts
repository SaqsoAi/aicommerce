import api from "./client";


export type Hero = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  video?: string;
  type: string;
  active: boolean;
  buttonText?: string;
  buttonLink?: string;
  secondaryText?: string;
  secondaryLink?: string;
  startDate?: string;
  endDate?: string;
};

type HeroListResponse = {
  success: boolean;
  data: Hero[];
};

type HeroResponse = {
  success: boolean;
  data: Hero;
};

// ================= GET ALL HEROES =================
export const getHeroes = async (): Promise<Hero[]> => {
  try {
    const res = await api.get<HeroListResponse>("/heroes");
    return res?.data?.data ?? [];
  } catch (error) {
    console.error("getHeroes error:", error);
    return [];
  }
};

// ================= GET HERO BY ID =================
export const getHeroById = async (
  id: string
): Promise<Hero | null> => {
  try {
    const res = await api.get<HeroResponse>(`/heroes/${id}`);
    return res?.data?.data ?? null;
  } catch (error) {
    console.error("getHeroById error:", error);
    return null;
  }
};

// ================= GET ACTIVE HERO =================
export const getActiveHero = async (): Promise<Hero | null> => {
  try {
    const heroes = await getHeroes();
    return heroes.find((hero) => hero.active) ?? null;
  } catch (error) {
    console.error("getActiveHero error:", error);
    return null;
  }
};

// ================= CREATE HERO =================
export const createHero = async (payload: Partial<Hero>) => {
  try {
    const res = await api.post("/heroes", payload);
    return res?.data ?? null;
  } catch (error) {
    console.error("createHero error:", error);
    return null;
  }
};

// ================= UPDATE HERO =================
export const updateHero = async (
  id: string,
  payload: Partial<Hero>
) => {
  try {
    const res = await api.put(`/heroes/${id}`, payload);
    return res?.data ?? null;
  } catch (error) {
    console.error("updateHero error:", error);
    return null;
  }
};

// ================= DELETE HERO =================
export const deleteHero = async (id: string) => {
  try {
    const res = await api.delete(`/heroes/${id}`);
    return res?.data ?? null;
  } catch (error) {
    console.error("deleteHero error:", error);
    return null;
  };
};