import { Router } from "express";
import { predictSize } from "./ai-size.controller";

const router = Router();

router.post("/predict", predictSize);

export default router;
