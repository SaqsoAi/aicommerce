const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const authHeaders = (): Record<string, string> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getVirtualTryOnJobs() {
  const res = await fetch(
    `${API}/virtual-tryon/history`,
    {
      cache: "no-store",
      headers: authHeaders(),
    }
  );

  return res.json();
}

export async function getVirtualTryOnJob(
  id: string
) {
  const res = await fetch(
    `${API}/virtual-tryon/${id}`,
    {
      cache: "no-store",
      headers: authHeaders(),
    }
  );

  return res.json();
}