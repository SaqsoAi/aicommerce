import type { AiBuilderIntent, AiBuilderLanguage, AiBuilderPrompt, AiBuilderScope } from "./types";

const BN = /[\u0980-\u09ff]/;
const LATIN = /[A-Za-z]/;

export function detectBuilderLanguage(input: string): AiBuilderLanguage {
  const bn = BN.test(input), en = LATIN.test(input);
  return bn && en ? "mixed" : bn ? "bn" : "en";
}

export function detectBuilderIntent(input: string): AiBuilderIntent {
  const p=input.toLowerCase();
  if (/(architecture|architect|structure|স্ট্রাকচার|আর্কিটেকচার)/.test(p)) return "ARCHITECTURE";
  if (/(plugin|manifest|installer|প্লাগিন)/.test(p)) return "PLUGIN";
  if (/(database|prisma|schema|migration|ডাটাবেস)/.test(p)) return "DATABASE";
  if (/(template|storefront|ecommerce|থিম|টেমপ্লেট)/.test(p)) return "TEMPLATE";
  if (/(review|code review|রিভিউ)/.test(p)) return "CODE_REVIEW";
  if (/(bug|debug|error|fix|সমস্যা|এরর)/.test(p)) return "DEBUG";
  if (/(refactor|clean code|রিফ্যাক্টর)/.test(p)) return "REFACTOR";
  if (/(documentation|docs|ডকুমেন্ট)/.test(p)) return "DOCUMENTATION";
  if (/(deploy|devops|production|deployment)/.test(p)) return "DEPLOYMENT";
  if (/(develop|build|create|make|বানাও|তৈরি)/.test(p)) return "DEVELOPMENT";
  return "GENERAL";
}

export function detectBuilderScopes(input:string): AiBuilderScope[] {
  const p=input.toLowerCase(), s=new Set<AiBuilderScope>();
  if (/(server|backend|api)/.test(p)) s.add("SERVER");
  if (/(admin|dashboard|react|next)/.test(p)) s.add("ADMIN");
  if (/(client|storefront|customer)/.test(p)) s.add("CLIENT");
  if (/(database|prisma|schema|migration)/.test(p)) s.add("DATABASE");
  if (/(plugin|manifest|installer)/.test(p)) s.add("PLUGIN");
  if (!s.size) s.add("PLATFORM");
  return [...s];
}

export function normalizeBuilderPrompt(prompt:string):AiBuilderPrompt {
  const clean=prompt.trim().replace(/\s+/g," ");
  return {prompt:clean,language:detectBuilderLanguage(clean),intent:detectBuilderIntent(clean),scopes:detectBuilderScopes(clean)};
}
