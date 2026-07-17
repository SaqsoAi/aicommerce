import { Router } from "express";
import {
  getRoleTheme,
  listThemeSettings,
  saveThemeSetting
} from "./theme-settings.controller";

const router = Router();

router.get("/", listThemeSettings);
router.get("/role/:role", getRoleTheme);
router.put("/", saveThemeSetting);
router.post("/", saveThemeSetting);

export default router;
