import api from "./client";

export type VirtualTryOnJob = {
  id: string; productId: string; personImage: string; garmentImage: string;
  resultImage?: string | null; status: string; error?: string | null; createdAt: string;
  product?: { id: string; name?: string; thumbnail?: string; price?: number };
};

export async function uploadVirtualTryOnPersonImage(file: Blob, filename = "person.jpg") {
  const form = new FormData(); form.append("file", file, filename);
  const response = await api.post("/virtual-tryon/person-image", form);
  return response.data?.data as { url: string };
}
export async function createVirtualTryOn(payload: { productId: string; personImage: string }) {
  const response = await api.post("/virtual-tryon/create", payload); return response.data;
}
export async function getMyVirtualTryOnHistory() { const response = await api.get("/virtual-tryon/history/me"); return response.data; }
export async function retryVirtualTryOn(id: string) { const response = await api.post(`/virtual-tryon/history/${id}/retry`); return response.data; }
export async function deleteVirtualTryOnHistory(id: string) { const response = await api.delete(`/virtual-tryon/history/${id}`); return response.data; }
