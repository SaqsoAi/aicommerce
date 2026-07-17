import fs from "fs"; import path from "path";
const SKIP=new Set(["node_modules",".next","dist","build",".git","PROJECT_AUDIT","uploads"]);
export interface RepositorySnapshot { root:string; applications:string[]; files:number; sourceFiles:number; routes:string[]; prismaModels:string[]; packageManagers:string[]; }
function rootOf(start:string){const p=path.resolve(start);return path.basename(p).toLowerCase()==="server"?path.dirname(p):p;}
export function inspectRepository(start=process.cwd()):RepositorySnapshot{
 const root=rootOf(start); let files=0,sourceFiles=0; const routes:string[]=[],pm:string[]=[];
 const walk=(dir:string)=>{if(!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(SKIP.has(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else{files++;if(/\.(ts|tsx|js|jsx|css|prisma)$/.test(e.name))sourceFiles++;const rel=path.relative(root,f).replace(/\\/g,"/");if(/routes?\.(ts|js)$/.test(e.name)||/\/app\/.*\/page\.tsx$/.test("/"+rel))routes.push(rel);if(e.name==="package-lock.json")pm.push(rel);}}};
 ["server","admin","client"].forEach(a=>walk(path.join(root,a)));
 const schema=path.join(root,"server","prisma","schema.prisma");const models=fs.existsSync(schema)?[...fs.readFileSync(schema,"utf8").matchAll(/^model\s+(\w+)/gm)].map(x=>x[1]):[];
 return{root,applications:["server","admin","client"].filter(a=>fs.existsSync(path.join(root,a))),files,sourceFiles,routes:routes.slice(0,500),prismaModels:models,packageManagers:pm};
}
