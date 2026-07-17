"use client";

import { useEffect, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

type Workflow = {
  id:string;
  name:string;
  slug:string;
  status:string;
  triggerType:string;
  isActive:boolean;
};

export default function AutomationStudioPage(){

  const [items,setItems]=useState<Workflow[]>([]);
  const [loading,setLoading]=useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers:HeadersInit={
    "Content-Type":"application/json",
    ...(token?{Authorization:`Bearer ${token}`}:{})
  };

  async function load(){
    try{
      const res=await fetch(
        `${API}/workflow-automation`,
        {headers}
      );

      const json=await res.json();
      setItems(json.data||[]);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    load();
  },[]);

  return(
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-cyan-300 uppercase tracking-widest text-sm">
            PHASE-4.0I-O
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Enterprise Workflow & Automation Studio
          </h1>

          <p className="text-slate-400 mt-2">
            Recovery package (O.7B)
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left py-2">Workflow</th>
                <th>Status</th>
                <th>Trigger</th>
                <th>Active</th>
              </tr>
            </thead>

            <tbody>

            {loading && (
              <tr>
                <td colSpan={4}>Loading...</td>
              </tr>
            )}

            {!loading && items.map(w=>(
              <tr
                key={w.id}
                className="border-t border-slate-800"
              >
                <td className="py-3">{w.name}</td>
                <td>{w.status}</td>
                <td>{w.triggerType}</td>
                <td>{w.isActive?"Yes":"No"}</td>
              </tr>
            ))}

            </tbody>

          </table>

        </div>

      </div>
    </main>
  );

}
