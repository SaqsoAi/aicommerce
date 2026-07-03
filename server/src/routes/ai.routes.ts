import express, {
  Request,
  Response,
} from "express";

import {
  generateCampaignIdea,
  generateFacebookCaption,
  generateHashtags,
  generateProductDescription,
  getRecommendations,
} from "../controllers/ai.controller";

import {
  generateDescription,
} from "../services/ai.service";

import {
  smartSearchAI,
} from "../ai/smartSearch.engine";

import {
  chatbotBrain,
} from "../ai/chatbot.engine";

const router = express.Router();

// ======================================
// AI CONTENT ROUTES
// ======================================

// Health Check
router.get(
  "/generate-description",
  (
    req: Request,
    res: Response
  ) => {
    res.json({
      success: true,
      message:
        "AI Description Route Working",
    });
  }
);

// Generate Product Description
router.post(
  "/generate-description",
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Product name is required",
        });
      }

      const result =
        await generateDescription(
          name
        );

      return res.json({
        success: true,
        description:
          result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "AI generation failed",
      });
    }
  }
);

// Campaign Idea
router.get(
  "/campaign-idea",
  generateCampaignIdea
);

// Product Description
router.post(
  "/product-description",
  generateProductDescription
);

// Facebook Caption
router.post(
  "/facebook-caption",
  generateFacebookCaption
);

// Hashtags
router.post(
  "/hashtags",
  generateHashtags
);

// ======================================
// AI RECOMMENDATION
// ======================================

router.post(
  "/recommend",
  getRecommendations
);

// ======================================
// SMART SEARCH
// ======================================

router.post(
  "/smart-search",
  (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        query,
        products,
      } = req.body;

      const result =
        smartSearchAI(
          query,
          products
        );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Smart search failed",
      });
    }
  }
);

// ======================================
// CHATBOT
// ======================================

router.post(
  "/chat",
  (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        userId,
        message,
      } = req.body;

      const reply =
        chatbotBrain(
          userId,
          message
        );

      return res.json({
        success: true,
        reply,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Chatbot failed",
      });
    }
  }
);

export default router;