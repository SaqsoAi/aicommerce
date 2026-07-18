import { Request, Response } from "express";
import openai from "../config/openai";
import { recommendProducts } from "../ai/recommendation.engine";

type AiControllerProductInput = {
  id: string;
  name: string;
  title?: string;
  description?: string;
  category: string;
  brand: string;
  price: number;
  image?: string;
  tags?: string[];
};

type AiControllerUserHistoryItem = {
  productid: string;
  name: string;
  title?: string;
  category: string;
  brand: string;
  score?: number;
};


/* =========================
   CAMPAIGN IDEA
========================= */
export const generateCampaignIdea = async (
  req: Request,
  res: Response
) => {
  try {
    const ideas = [
      "Eid Fashion Blast",
      "Luxury Summer Combo",
      "Weekend Flash Sale",
      "Buy 2 Get 1 Free",
    ];

    const randomIdea =
      ideas[Math.floor(Math.random() * ideas.length)];

    res.status(200).json({ idea: randomIdea });
  } catch (error: any) {
    res.status(500).json({
      message: "AI generation failed",
    });
  }
};

/* =========================
   PRODUCT DESCRIPTION (OPENAI)
========================= */
export const generateProductDescription = async (
  req: Request,
  res: Response
) => {
  try {
    const { productName, category } = req.body as {
      productName?: string;
      category?: string;
    };

    const prompt = `
      Write a luxury ecommerce product description 
      for ${productName ?? "Product"} in ${category ?? "Fashion"} category.
      Make it premium, SEO optimized and modern.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({
      description: response.choices[0]?.message?.content ?? "",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "AI description failed",
    });
  }
};

/* =========================
   FACEBOOK CAPTION
========================= */
export const generateFacebookCaption = async (
  req: Request,
  res: Response
) => {
  try {
    const { productName } = req.body as {
      productName?: string;
    };

    const prompt = `
      Create a modern luxury Facebook caption 
      for ${productName ?? "fashion product"}.
      Include emotional marketing tone.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({
      caption: response.choices[0]?.message?.content ?? "",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Caption generation failed",
    });
  }
};

/* =========================
   HASHTAG GENERATOR
========================= */
export const generateHashtags = async (
  req: Request,
  res: Response
) => {
  try {
    const { keyword } = req.body as {
      keyword?: string;
    };

    const prompt = `
      Generate 20 viral fashion hashtags 
      for ${keyword ?? "fashion"}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({
      hashtags: response.choices[0]?.message?.content ?? "",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Hashtag generation failed",
    });
  }
};

/* =========================
   RECOMMENDATION ENGINE
========================= */
export const getRecommendations = async (
  req: Request,
  res: Response
) => {
  try {
    const { userHistory, products } = req.body as {
      userHistory?: AiControllerUserHistoryItem[];
      products?: AiControllerProductInput[];
    };

    const result = recommendProducts(
      userHistory ?? [],
      products ?? []
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Recommendation failed",
    });
  }
};