import { Request, Response, NextFunction } from "express";

// CREATE HERO VALIDATION
export const validateCreateHero = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    title,
    image,
    order,
    startDate,
    endDate,
    buttonText,
    buttonLink,
      mobileImage,
      tabletImage,
      desktopImage,
      imageFocus,
      textSafeZone,
  } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (order !== undefined && typeof order !== "number") {
    return res.status(400).json({
      success: false,
      message: "Order must be a number",
    });
  }

  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      message: "Invalid startDate format",
    });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      message: "Invalid endDate format",
    });
  }

  if (buttonLink && typeof buttonLink !== "string") {
    return res.status(400).json({
      success: false,
      message: "buttonLink must be a string",
    });
  }

  next();
};

// UPDATE HERO VALIDATION
export const validateUpdateHero = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate, order } = req.body;

  if (order !== undefined && typeof order !== "number") {
    return res.status(400).json({
      success: false,
      message: "Order must be a number",
    });
  }

  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      message: "Invalid startDate format",
    });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      message: "Invalid endDate format",
    });
  }

  next();
};
