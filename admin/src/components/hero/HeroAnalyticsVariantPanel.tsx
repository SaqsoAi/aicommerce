"use client";

import { useMemo, useState } from "react";

type VariantStatus = "ACTIVE" | "TESTING" | "WINNER";

const seed = [
  { id: "A", name: "Premium Fashion Hero", views: 64210, clicks: 4021, ctr: 6.26, conversion: 2.8, status: "ACTIVE" as VariantStatus },
  { id: "B", name: "Luxury Drop Hero", views: 54880, clicks: 3870, ctr: 7.05, conversion: 3.2, status: "TESTING" as VariantStatus },
  { id: "C", name: "AI Styled Hero", views: 30120, clicks: 1760, ctr: 5.84, conversion: 2.4, status: "TESTING" as VariantStatus },
];

export default function HeroAnalyticsVariantPanel(){
  const [variants,setVariants]=useState(seed);
  const [active,setActive]=useState("A");

  const winner=useMemo(()=>[...variants].sort((a,b)=>b.ctr-a.ctr)[0], [variants]);
  const totals=useMemo(()=>({
    views: variants.reduce((s,v)=>s+v.views,0),
    clicks: variants.reduce((s,v)=>s+v.clicks,0),
    ctr: Number((variants.reduce((s,v)=>s+v.clicks,0)/Math.max(1,variants.reduce((s,v)=>s+v.views,0))*100).toFixed(2)),
    conversion: Number((variants.reduce((s,v)=>s+v.conversion,0)/variants.length).toFixed(2)),
  }),[variants]);

  const activate=(id:string)=>{
    setActive(id);
    setVariants(prev=>prev.map(v=>({...v,status:v.id===id?"ACTIVE":v.id===winner.id?"WINNER":"TESTING"})));
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 text-white shadow-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">SPRINT-1.7D.4</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Hero Analytics & A/B Variant Manager</h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">Views, CTR, conversion, device performance and winner foundation.</p>
        </div>
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm font-black text-amber-100">
          Winner: Variant {winner.id}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-950/60 p-5"><p className="text-sm text-slate-400">Views</p><p className="mt-2 text-3xl font-black">{totals.views.toLocaleString()}</p></div>
        <div className="rounded-2xl bg-slate-950/60 p-5"><p className="text-sm text-slate-400">Clicks</p><p className="mt-2 text-3xl font-black">{totals.clicks.toLocaleString()}</p></div>
        <div className="rounded-2xl bg-slate-950/60 p-5"><p className="text-sm text-slate-400">CTR</p><p className="mt-2 text-3xl font-black">{totals.ctr}%</p></div>
        <div className="rounded-2xl bg-slate-950/60 p-5"><p className="text-sm text-slate-400">Conversion</p><p className="mt-2 text-3xl font-black">{totals.conversion}%</p></div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {variants.map(v=>(
            <div key={v.id} className={`rounded-2xl border p-4 ${active===v.id?"border-emerald-400 bg-emerald-400/10":"border-white/10 bg-slate-950/55"}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">Variant {v.id}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-slate-300">{v.status}</span>
                  </div>
                  <h4 className="mt-3 text-lg font-black">{v.name}</h4>
                  <p className="mt-1 text-sm text-slate-400">{v.views.toLocaleString()} views Â· {v.clicks.toLocaleString()} clicks Â· {v.ctr}% CTR</p>
                </div>
                <button onClick={()=>activate(v.id)} className="rounded-xl bg-emerald-400 px-4 py-3 text-xs font-black text-slate-950">Activate</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Device Performance</p>
          {[
            ["Desktop",52],
            ["Laptop",24],
            ["Tablet",14],
            ["Mobile",10],
          ].map(([name,val])=>(
            <div key={name} className="mt-4">
              <div className="flex justify-between text-sm font-black"><span>{name}</span><span>{val}%</span></div>
              <div className="mt-2 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-cyan-400" style={{width:`${val}%`}} /></div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}