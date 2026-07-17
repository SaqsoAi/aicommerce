const API_BASE=process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000/api";
function token(){return typeof window==="undefined"?null:localStorage.getItem("token");}
async function call<T>(path:string,init?:RequestInit):Promise<T>{const t=token();const res=await fetch(`${API_BASE}/ai-development-copilot${path}`,{...init,headers:{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{ }),...(init?.headers||{})},cache:"no-store"});if(!res.ok)throw new Error(`AI Builder request failed: ${res.status}`);return res.json() as Promise<T>;}
export const getBuilderHealth=()=>call("/health");
export const getBuilderRepository=()=>call("/repository");
export const getBuilderGraph=()=>call("/knowledge-graph");
export const askAiBuilder=(prompt:string)=>call<{success:boolean;data:any}>("/chat",{method:"POST",body:JSON.stringify({prompt})});
