import { Router } from "express";
import { getAllTemplates } from "./template.controller";

const router = Router();

router.get("/", getAllTemplates);

export default router;