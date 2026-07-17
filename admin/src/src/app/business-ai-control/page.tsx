"use client";
import { useState } from "react";

export default function BusinessAiControlPage(){
 const [tenantId,setTenantId]=useState("");const [storeId,setStoreId]=useState("");
 const [enabled,setEnabled]=useState(true);const [approval,setApproval]=useState(true);
 const [budget,setBudget]=useState("");const [status,setStatus]=useState("");
 async function save(){
  setStatus("Saving…");const token=localStorage.getItem("token");
  const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000/api"}/ai/business-intelligence/platform/control`,{method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({tenantId,storeId:storeId||null,enabled,approvalRequired:approval,monthlyBudgetLimit:budget?Number(budget):null,allowedRoles:["ADMIN","MANAGER","MARKETING","FINANCE_MANAGER"]})});
  const json=await res.json();setStatus(res.ok?"Saved":"Failed: "+(json?.error?.message||json?.error||"Unknown"));
 }
 return <main style={{padding:24,maxWidth:960,margin:"auto"}}><h1>Business AI Platform Control</h1><p>Enable Business AI per tenant/store and enforce approval and budget policy.</p><div style={{display:"grid",gap:14,padding:20,border:"1px solid #293650",borderRadius:16,background:"#0d1527"}}>
  <label>Tenant ID<input value={tenantId} onChange={e=>setTenantId(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>
  <label>Store ID<input value={storeId} onChange={e=>setStoreId(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>
  <label><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Business AI enabled</label>
  <label><input type="checkbox" checked={approval} onChange={e=>setApproval(e.target.checked)}/> Approval required for actions</label>
  <label>Monthly budget limit<input value={budget} onChange={e=>setBudget(e.target.value)} type="number" style={{display:"block",width:"100%",padding:10}}/></label>
  <button onClick={save} style={{padding:12}}>Save control policy</button><b>{status}</b>
 </div></main>
}
