import { Request, Response } from "express";
import {
  getThemeSettings,
  upsertThemeSetting
} from "./theme-settings.service";

function getSingleParam(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

export async function listThemeSettings(req: Request, res: Response) {
  const scope = getSingleParam(req.query.scope);
  const role = getSingleParam(req.query.role);

  const result = await getThemeSettings(scope, role);
  return res.json(result);
}

export async function saveThemeSetting(req: Request, res: Response) {
  const result = await upsertThemeSetting(req.body);
  return res.json(result);
}

export async function getRoleTheme(req: Request, res: Response) {
  const role = getSingleParam(req.params.role);

  const result = await getThemeSettings("ROLE", role);
  return res.json(result);
}
