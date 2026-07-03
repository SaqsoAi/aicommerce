import api from "@/api/client";

export const getHomepageHeroes = async () => {
  const res = await api.get("/homepage-hero");
  return res.data;
};

export const getSocialFeedSettings = async () => {
  const res = await api.get("/social-feed-settings");
  return res.data;
};
