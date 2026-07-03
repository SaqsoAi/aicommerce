export const getHomepageSections = async () => {
  const res = await fetch("/api/backend/homepage-sections", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load homepage sections");
  }

  const data = await res.json();

  return data.data || [];
};
