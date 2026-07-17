const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export async function getBrandingSettings() {
  try {
    const res = await fetch(
      `${API}/theme-settings?scope=ADMIN`
    );

    const data = await res.json();

    const branding = Array.isArray(data?.data)
      ? data.data.find(
          (x: any) => x.key === "branding-settings"
        )
      : null;

    return (
      branding?.value || {
        brandName: "SAQSO",
        brandShortName: "SQ",
        brandSlogan: "",
        adminLogo: "",
        clientLogo: ""
      }
    );
  } catch {
    return {
      brandName: "SAQSO",
      brandShortName: "SQ",
      brandSlogan: "",
      adminLogo: "",
      clientLogo: ""
    };
  }
}
