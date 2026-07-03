import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getSubcategories = async () => {
  const res = await axios.get(`${API}/subcategories`);
  return res.data;
};

export const getSubcategoriesByCategory = async (categoryId: string) => {
  const res = await axios.get(`${API}/subcategories/category/${categoryId}`);
  return res.data;
};

export const createSubcategory = async (payload: {
  name: string;
  slug: string;
  categoryId: string;
}) => {
  const res = await axios.post(`${API}/subcategories`, payload);
  return res.data;
};

export const updateSubcategory = async (
  id: string,
  payload: {
    name: string;
    slug: string;
    categoryId: string;
  }
) => {
  const res = await axios.put(`${API}/subcategories/${id}`, payload);
  return res.data;
};

export const deleteSubcategory = async (id: string) => {
  const res = await axios.delete(`${API}/subcategories/${id}`);
  return res.data;
};
