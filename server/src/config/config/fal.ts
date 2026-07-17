import { fal } from "@fal-ai/client";

if (!process.env.FAL_KEY) {
  console.warn("FAL_KEY is missing. Virtual Try-On will fail until FAL_KEY is configured.");
}

fal.config({
  credentials: process.env.FAL_KEY || "",
});

export default fal;
