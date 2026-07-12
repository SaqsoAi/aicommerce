import { Router } from "express";
import { getDashboard } from "./dashboard.controller";

const router = Router();
router.get("/summary", getDashboard);
router.get("/role-dashboard", getDashboard);
router.get("/super-admin", getDashboard);
router.get("/admin", getDashboard);
router.get("/user-admin", getDashboard);

export default router;
