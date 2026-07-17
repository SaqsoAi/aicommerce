export interface BuilderMemoryEntry { key:string; category:string; language:string; summary:string; content:string; source:string; confidence:number; createdAt:string; }
const memory=new Map<string,BuilderMemoryEntry>();
export function remember(entry:Omit<BuilderMemoryEntry,"createdAt">){const value={...entry,createdAt:new Date().toISOString()};memory.set(entry.key,value);return value;}
export function recall(query:string){const q=query.toLowerCase();return [...memory.values()].filter(x=>(x.key+" "+x.summary+" "+x.content).toLowerCase().includes(q)).slice(0,20);}
export function memoryStatus(){return{provider:"IN_MEMORY_WITH_OPTIONAL_PRISMA_PERSISTENCE",entries:memory.size,databaseReady:false};}
