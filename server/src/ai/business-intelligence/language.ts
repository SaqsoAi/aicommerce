import type { BusinessIntent, BusinessLanguage } from "./businessAdvisor.types";

const bn = /[\u0980-\u09FF]/;
const englishWords = /[A-Za-z]/;

export function detectBusinessLanguage(text: string): BusinessLanguage {
  const hasBn = bn.test(text);
  const hasEn = englishWords.test(text);
  return hasBn && hasEn ? "mixed" : hasBn ? "bn" : "en";
}

export function detectBusinessIntent(text: string): BusinessIntent {
  const q = text.toLowerCase();
  if (/(20000|target|goal|budget|boost|লক্ষ্য|বাজেট)/.test(q)) return "SALES_GOAL_PLAN";
  if (/(product|পণ্য|চলতেছে না|চলছে না|slow|dead stock|discontinue)/.test(q)) return "PRODUCT_PERFORMANCE";
  if (/(customer|retention|loyal|repeat|কাস্টমার|গ্রাহক)/.test(q)) return "CUSTOMER_INTELLIGENCE";
  if (/(campaign|marketing|boost|ads|মার্কেটিং|ক্যাম্পেইন)/.test(q)) return "MARKETING_PLAN";
  if (/(ceo|executive|report|print|রিপোর্ট)/.test(q)) return "CEO_REPORT";
  if (/(sale|sales|revenue|বিক্রি|সেল|কম কেন)/.test(q)) return "SALES_DIAGNOSIS";
  return "GENERAL_BUSINESS";
}
