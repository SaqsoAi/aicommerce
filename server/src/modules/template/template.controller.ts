import { Request, Response } from "express";
import { getTemplates } from "./template.service";

export const getAllTemplates = async (
  req: Request,
  res: Response
) => {
  const templates = await getTemplates();

  res.json({
    success: true,
    data: templates,
  });
};