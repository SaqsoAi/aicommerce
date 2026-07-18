import { Request, Response } from "express";

import prisma from "../config/prisma";

export const createCampaign =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const campaign =
        await prisma.campaign.create({
          data: req.body,
        });

      res.status(201).json(
        campaign
      );
    } catch (error: any) {
      res.status(500).json({
        message:
          "Campaign creation failed",
      });
    }
  };

export const getCampaigns =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const campaigns =
        await prisma.campaign.findMany();

      res.status(200).json(
        campaigns
      );
    } catch (error: any) {
      res.status(500).json({
        message:
          "Failed to fetch campaigns",
      });
    }
  };