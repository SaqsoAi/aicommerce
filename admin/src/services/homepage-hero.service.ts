import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getHomepageHeroes = async () => {
  const res = await axios.get(`${API}/homepage-hero`);
  return res.data.data;
};

export const createHomepageHero = async (data: any) => {
  const res = await axios.post(`${API}/homepage-hero`, data);
  return res.data;
};

export const updateHomepageHero = async (id: string, data: any) => {
  const res = await axios.put(`${API}/homepage-hero/${id}`, data);
  return res.data;
};

export const deleteHomepageHero = async (id: string) => {
  const res = await axios.delete(`${API}/homepage-hero/${id}`);
  return res.data;
};

export const getSocialFeedSettings = async () => {
  const res = await axios.get(`${API}/social-feed-settings`);
  return res.data.data;
};

export const updateSocialFeedSettings = async (data: any) => {
  const res = await axios.put(`${API}/social-feed-settings`, data);
  return res.data;
};
