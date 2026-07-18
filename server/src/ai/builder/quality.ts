import type { AiBuilderArtifact } from "./types";
export function qualityPlan(prompt:string){
 const lower=prompt.toLowerCase();const mode=/(bug|debug|error|fix)/.test(lower)?"DEBUG":/(refactor|clean)/.test(lower)?"REFACTOR":"CODE_REVIEW";
 const checks=["TypeScript compilation","Import and ownership graph","Authentication and RBAC","Tenant/store filtering","Error and rollback paths","Responsive UI regression"];
 const artifacts:AiBuilderArtifact[]=[{kind:"CODE_REVIEW",title:`${mode} checklist`,content:checks.map((x,i)=>`${i+1}. ${x}`).join("\n")}];
 return{mode,checks,artifacts,commands:["npm run build","npm test --if-present"],autoFix:false,approvalRequired:true};
}
