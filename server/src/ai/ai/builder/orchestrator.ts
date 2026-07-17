import { normalizeBuilderPrompt } from "./language";
import { inspectRepository } from "./repository";
import { buildKnowledgeGraph } from "./knowledgeGraph";
import { architecturePlan } from "./architect";
import { qualityPlan } from "./quality";
import { generatePluginManifest } from "./pluginGenerator";
import { ecommerceTemplateBlueprint } from "./templateStudio";
import { deploymentPlan, documentationPlan, taskPlan } from "./deliveryAdvisor";

export function answerBuilder(prompt:string){
 const input=normalizeBuilderPrompt(prompt); const base=architecturePlan(input);
 const repo=inspectRepository(process.cwd()); const graph=buildKnowledgeGraph(repo);
 const specialized:any={};
 if(["CODE_REVIEW","DEBUG","REFACTOR"].includes(input.intent)) specialized.quality=qualityPlan(prompt);
 if(input.intent==="PLUGIN") specialized.pluginManifest=generatePluginManifest({pluginKey:"vendor.generated-plugin",name:"Generated Plugin",version:"1.0.0"});
 if(input.intent==="TEMPLATE") specialized.template=ecommerceTemplateBlueprint(prompt);
 if(input.intent==="DOCUMENTATION") specialized.documentation=documentationPlan(prompt);
 if(input.intent==="DEPLOYMENT") specialized.deployment=deploymentPlan();
 specialized.tasks=taskPlan(prompt);
 return{...base,repository:{applications:repo.applications,files:repo.files,sourceFiles:repo.sourceFiles,models:repo.prismaModels.length,routes:repo.routes.length},knowledgeGraph:graph.summary,specialized,voice:{inputSupported:true,outputSupported:true,languages:["bn-BD","en-US","mixed"]}};
}
