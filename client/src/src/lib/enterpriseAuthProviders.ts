export async function getEnterpriseAuthProviders() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const res = await fetch(`${base}/enterprise-auth-providers`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.providers || [];
}