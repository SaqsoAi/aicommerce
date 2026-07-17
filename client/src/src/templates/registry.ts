import FashionHome from "./fashion/HomeTemplate";
import LuxuryHome from "./luxury/HomeTemplate";
import ModernHome from "./modern/HomeTemplate";
import SaqsoBuildHome from "./saqsobuild/HomeTemplate";

export const templates = {
  fashion: FashionHome,
  luxury: LuxuryHome,
  modern: ModernHome,
  saqsobuild: SaqsoBuildHome,
} as const;
