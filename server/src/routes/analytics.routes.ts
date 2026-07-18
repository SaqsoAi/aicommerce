import express from "express";
import { getDashboardStats } from "../controllers/analytics.controller";

const router = express.Router();

router.get("/dashboard", getDashboardStats);

export default router;