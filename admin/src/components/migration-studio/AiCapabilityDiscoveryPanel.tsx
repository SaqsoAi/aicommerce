"use client";

const PLATFORM_AI = [
  ["AI Chat","chat, assistant, copilot"],["AI Search","semantic search, smart search, embeddings"],["Recommendations","recommendation, personalization"],["Vision","vision, visual search, image analysis"],["Virtual Try-On","try-on, tryon, virtual fitting"],["Size Recommendation","size recommender, fit assistant"],["AI Content","content generator, copywriter"],["AI Marketing","campaign ai, marketing automation"],["AI Social","social manager, social automation"],["Business Intelligence","forecast, analytics ai, insights"],
] as const;

export type AiCapabilityPlan = {name:string;status:"REUSE_EXISTING"|"IMPLEMENT_NEW"|"PLATFORM_OPTIONAL";evidence:string[];plan:string};
export function buildAiCapabilityPlan(imported:string[]):AiCapabilityPlan[]{
 const normalized=imported.map(v=>v.toLowerCase());
 const plans:AiCapabilityPlan[]=PLATFORM_AI.map(([name,terms])=>{const evidence=terms.split(", ").filter(t=>normalized.some(v=>v.includes(t)||t.includes(v)));return {name,status:evidence.length?"REUSE_EXISTING":"PLATFORM_OPTIONAL",evidence,plan:evidence.length?`Connect imported ${name} UI to current AI gateway/provider/model/prompt registries.`:`Keep current ${name} capability available; expose it in the migrated template only when selected.`};});
 for(const signal of imported){if(!PLATFORM_AI.some(([,terms])=>terms.split(", ").some(t=>signal.toLowerCase().includes(t)||t.includes(signal.toLowerCase()))))plans.push({name:signal,status:"IMPLEMENT_NEW",evidence:[signal],plan:`Implement ${signal} using the existing AI gateway. Generate server service, provider configuration, permission, feature flag, Admin settings and client UI. Database work, if required, must be emitted as a separate PowerShell package.`});}
 return plans;
}
export default function AiCapabilityDiscoveryPanel({imported}:{imported:string[]}){const plans=buildAiCapabilityPlan(imported);return <section style={{marginTop:16,padding:18,border:"1px solid rgba(148,163,184,.18)",borderRadius:14,background:"rgba(15,23,42,.72)"}}><h2>AI Capability Detection & Implementation Plan</h2><p style={{color:"#94a3b8"}}>Imported AI signals are compared with the current platform. Existing capabilities are reused; genuinely new capabilities receive an implementation plan.</p><div style={{display:"grid",gap:10}}>{plans.map(p=><div key={p.name} style={{padding:12,border:"1px solid rgba(148,163,184,.14)",borderRadius:10}}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><b>{p.name}</b><span>{p.status}</span></div><p style={{margin:"6px 0 0",color:"#a8b7cc"}}>{p.plan}</p></div>)}</div></section>}
