import type { RepositorySnapshot } from "./repository";
export interface KnowledgeNode { id:string; type:"APP"|"ROUTE"|"MODEL"|"MODULE"; label:string; }
export interface KnowledgeEdge { from:string; to:string; relation:string; }
export function buildKnowledgeGraph(snapshot:RepositorySnapshot){
 const nodes:KnowledgeNode[]=snapshot.applications.map(a=>({id:`app:${a}`,type:"APP",label:a}));
 snapshot.routes.forEach(r=>nodes.push({id:`route:${r}`,type:"ROUTE",label:r}));
 snapshot.prismaModels.forEach(m=>nodes.push({id:`model:${m}`,type:"MODEL",label:m}));
 const edges:KnowledgeEdge[]=[];
 snapshot.routes.forEach(r=>{const app=snapshot.applications.find(a=>r.startsWith(a+"/"));if(app)edges.push({from:`app:${app}`,to:`route:${r}`,relation:"OWNS"});});
 snapshot.prismaModels.forEach(m=>edges.push({from:"app:server",to:`model:${m}`,relation:"USES"}));
 return{nodes,edges,summary:{nodes:nodes.length,edges:edges.length}};
}
