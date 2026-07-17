import fs from "fs";import path from "path";import crypto from "crypto";
export function executiveReport(root:string,context:any,data:any){const id=crypto.randomUUID();const dir=path.join(root,"PROJECT_AUDIT","BUSINESS_AI_REPORTS",id);fs.mkdirSync(dir,{recursive:true});const report={id,tenantId:context.tenantId,storeId:context.storeId,generatedAt:new Date().toISOString(),...data};fs.writeFileSync(path.join(dir,"report.json"),JSON.stringify(report,null,2));fs.writeFileSync(path.join(dir,"report.txt"),`${data.title}

${data.summary}

${JSON.stringify(data.metrics,null,2)}`);return {...report,path:dir,formats:["JSON","TXT","BROWSER_PRINT"]};}
