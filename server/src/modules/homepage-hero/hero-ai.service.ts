import fs from "fs";
import path from "path";

type HeroAiInput = {
  filename?: string;
  url?: string;
  businessType?: string;
};

function localFallback(input: HeroAiInput) {
  const text = `${input.filename || ""} ${input.url || ""}`.toLowerCase();

  if (
    text.includes("panjabi") ||
    text.includes("punjabi") ||
    text.includes("ethnic") ||
    text.includes("eid") ||
    text.includes("kurta")
  ) {
    return {
      headline: "Premium Panjabi Collection",
      description:
        "Discover elegant ethnic wear designed for Eid, weddings, Jummah and premium festive occasions.",
      shortDescription:
        "Elegant Panjabi and ethnic wear for modern festive style.",
      primaryCtaLabel: "Shop Panjabi",
      primaryCtaLink: "/shop?category=ethnic-wear",
      secondaryCtaLabel: "Ethnic Wear",
      secondaryCtaLink: "/shop?category=ethnic-wear",
      altText: "Premium Panjabi ethnic wear hero banner",
      qualityMode: "4K",
      sliderEffect: "saqso-luxury",
    };
  }

  if (
    text.includes("saree") ||
    text.includes("sharee") ||
    text.includes("lehenga")
  ) {
    return {
      headline: "Elegant Women Ethnic Collection",
      description:
        "Explore premium saree, lehenga and festive fashion crafted for graceful celebrations.",
      shortDescription:
        "Premium women ethnic fashion for festive and occasion wear.",
      primaryCtaLabel: "Shop Women",
      primaryCtaLink: "/shop?category=women-ethnic",
      secondaryCtaLabel: "Festive Wear",
      secondaryCtaLink: "/shop?category=festive-wear",
      altText: "Women ethnic fashion hero banner",
      qualityMode: "4K",
      sliderEffect: "editorial-pan",
    };
  }

  if (
    text.includes("shirt") ||
    text.includes("tshirt") ||
    text.includes("t-shirt")
  ) {
    return {
      headline: "Modern Everyday Fashion",
      description:
        "Upgrade your wardrobe with premium shirts, tees and smart casual essentials.",
      shortDescription:
        "Clean, modern and comfortable fashion for everyday style.",
      primaryCtaLabel: "Shop Casual",
      primaryCtaLink: "/shop?category=casual-wear",
      secondaryCtaLabel: "New Arrivals",
      secondaryCtaLink: "/shop?sort=new",
      altText: "Modern casual fashion hero banner",
      qualityMode: "4K",
      sliderEffect: "ken-burns",
    };
  }

  if (
    text.includes("sale") ||
    text.includes("offer") ||
    text.includes("discount")
  ) {
    return {
      headline: "Exclusive Fashion Offers",
      description:
        "Shop premium collections with limited-time deals, rewards and member benefits.",
      shortDescription:
        "Limited-time fashion offers are live now.",
      primaryCtaLabel: "Shop Offers",
      primaryCtaLink: "/shop?campaign=offers",
      secondaryCtaLabel: "View Deals",
      secondaryCtaLink: "/campaigns",
      altText: "Fashion offer campaign hero banner",
      qualityMode: "4K",
      sliderEffect: "zoom",
    };
  }

  return {
    headline: "Premium Fashion Collection",
    description:
      "Discover curated fashion collections with AI powered shopping, rewards and premium style.",
    shortDescription:
      "Premium fashion, smart shopping and rewards in one experience.",
    primaryCtaLabel: "Shop Collection",
    primaryCtaLink: "/shop",
    secondaryCtaLabel: "Explore Style",
    secondaryCtaLink: "/shop",
    altText: "Premium fashion hero banner",
    qualityMode: "4K",
    sliderEffect: "cinematic",
  };
}

function getLocalImageBase64(url?: string) {
  if (!url || !url.startsWith("/uploads/")) return null;

  const filePath = path.join(
    process.cwd(),
    "public",
    url.replace("/uploads/", "uploads/")
  );

  if (!fs.existsSync(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

export const generateHomepageHeroAiCopy = async (input: HeroAiInput) => {
  const fallback = localFallback(input);

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const imageData = getLocalImageBase64(input.url);

    if (!apiKey || !imageData) return fallback;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Analyze ecommerce fashion image. Return ONLY valid JSON: headline, description, shortDescription, primaryCtaLabel, primaryCtaLink, secondaryCtaLabel, secondaryCtaLink, altText, sliderEffect. If Panjabi/ethnic wear then use /shop?category=ethnic-wear. Do not return generic SAQSO Premium Fashion unless product is unclear.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Generate fresh homepage hero copy and CTA by analyzing this uploaded image.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData,
                },
              },
            ],
          },
        ],
        temperature: 0.6,
      }),
    });

    const json: any = await response.json();
    const raw = json?.choices?.[0]?.message?.content;

    if (!raw) return fallback;

    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      ...fallback,
      ...parsed,
      qualityMode: "4K",
    };
  } catch {
    return fallback;
  }
};
