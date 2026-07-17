import api from "@/api/client";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const getCategories =
  async (search?: string) => {
    const res = await api.get("/categories", {
      params: { search },
    });

    return res.data?.data || res.data || [];
  };

export const createCategory =
  async (data: {
    name: string;
    slug: string;
    image?: string;
  }) => {
    const res = await api.post("/categories", data);
    return res.data;
  };

export const updateCategory =
  async (
    id: string,
    data: {
      name: string;
      slug: string;
      image?: string;
    }
  ) => {
    const endpoints = [
      `${API}/categories/${id}`,
      `${API}/categories/update/${id}`,
      `${API}/category/${id}`,
    ];

    let lastError: any = null;

    for (const url of endpoints) {
      for (const method of ["put", "patch"] as const) {
        try {
          const res = await api.request({
            url,
            method,
            data,
            headers: {
              "Content-Type": "application/json",
            },
          });

          return res.data;
        } catch (error) {
          lastError = error;
        }
      }
    }

    throw lastError;
  };

export const deleteCategory =
  async (id: string) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  };
