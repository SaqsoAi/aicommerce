import { Request, Response } from "express";

import {
  createHero as createHeroService,
  getHeroes as getHeroesService,
  getHeroById as getHeroByIdService,
  updateHero as updateHeroService,
  deleteHero as deleteHeroService,
} from "./hero.service";

interface HeroParams {
  id: string;
}

// ================= CREATE HERO =================
export const createHero = async (req: Request, res: Response) => {
  try {
    const hero = await createHeroService(req.body);

    return res.status(201).json({
      success: true,
      data: hero,
    });
  } catch (error: any) {
    console.error("CREATE HERO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create hero",
    });
  }
};

// ================= GET ALL HEROES =================
export const getHeroes = async (req: Request, res: Response) => {
  try {
    const result = await getHeroesService();

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch heroes",
    });
  }
};

// ================= GET HERO BY ID =================
export const getHeroById = async (
  req: Request<HeroParams>,
  res: Response
) => {
  try {
    const hero = await getHeroByIdService(req.params.id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: hero,
    });
  } catch (error: any) {
    console.error("GET HERO BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch hero",
    });
  }
};

// ================= UPDATE HERO =================
export const updateHero = async (
  req: Request<HeroParams>,
  res: Response
) => {
  try {
    const hero = await updateHeroService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: hero,
    });
  } catch (error: any) {
    console.error("UPDATE HERO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update hero",
    });
  }
};

// ================= DELETE HERO =================
export const deleteHero = async (
  req: Request<HeroParams>,
  res: Response
) => {
  try {
    await deleteHeroService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Hero deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE HERO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete hero",
    });
  }
};