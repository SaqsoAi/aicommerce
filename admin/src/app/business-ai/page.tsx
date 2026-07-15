"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import "./business-ai.css";

type Answer={headline:string;directAnswer:string;confidence:number;evidence:any[];actions:any[];risks:string[];printablePlan?:any};
type Message={id:string;role:"user"|"assistant";text:string;answer?:Answer};

const prompts=[
  "আমার sale কম কেন?",
  "Kon product choltese na, segula kivhabe chalano jay?",
  "আমি এই মাসে 20000pcs sale করতে চাই, boosting budget 5 লাখ।",
  "Customer retention বাড়ানোর actual plan দাও।",
];

export default function BusinessAiPage(){
 const [messages,setMessages]=useState<Message[]>([{id:"welcome",role:"assistant",text:"আমি আপনার store-এর sales, products, customers, inventory এবং campaigns বিশ্লেষণ করে evidence-based plan দিতে পারি।"}]);
 const [text,setText]=useState("");
 const [loading,setLoading]=useState(false);
 const [voice,setVoice]=useState(false);
 const bottom=useRef<HTMLDivElement>(null);
 useEffect(()=>bottom.current?.scrollIntoView({behavior:"smooth"}),[messages,loading]);

 async function send(value=text){
  const message=value.trim(); if(!message||loading)return;
  setText(""); setMessages(x=>[...x,{id:crypto.randomUUID(),role:"user",text:message}]); setLoading(true);
  const numbers=message.match(/\d[\d,]*/g)?.map(x=>Number(x.replace(/,/g,"")))??[];
  const body:any={message,periodDays:30};
  if(/pcs|unit|পিস/i.test(message)&&numbers[0]) body.targetUnits=numbers[0];
  if(/budget|বাজেট|boost/i.test(message)&&numbers[1]) body.budget=numbers[1] < 10000 ? numbers[1]*100000 : numbers[1];
  try{
   const token=localStorage.getItem("token");
   const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000/api"}/ai/business-intelligence/chat`,{method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
   const json=await res.json(); if(!res.ok)throw new Error(json?.error?.message||"Request failed");
   setMessages(x=>[...x,{id:crypto.randomUUID(),role:"assistant",text:json.data.directAnswer,answer:json.data}]);
  }catch(e:any){setMessages(x=>[...x,{id:crypto.randomUUID(),role:"assistant",text:`Business AI request failed: ${e.message}`}]);}
  finally{setLoading(false);}
 }
 function startVoice(){
  const Ctor=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!Ctor){alert("Voice recognition is not supported in this browser.");return;}
  const r=new Ctor(); r.lang="bn-BD"; r.interimResults=true; setVoice(true);
  r.onresult=(e:any)=>setText(Array.from(e.results).map((x:any)=>x[0].transcript).join(""));
  r.onend=()=>setVoice(false); r.onerror=()=>setVoice(false); r.start();
 }
 function speak(text:string){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=/[\u0980-\u09FF]/.test(text)?"bn-BD":"en-US";speechSynthesis.speak(u);}
 function printAnswer(answer:Answer){const w=window.open("","_blank");if(!w)return;w.document.write(`<title>${answer.headline}</title><style>body{font-family:Arial;padding:40px}table{width:100%;border-collapse:collapse}td{border:1px solid #ddd;padding:8px}</style><h1>${answer.headline}</h1><p>${answer.directAnswer}</p><h2>Evidence</h2><table>${answer.evidence.map(e=>`<tr><td>${e.label}</td><td>${e.value}</td><td>${e.source}</td></tr>`).join("")}</table><h2>Actions</h2>${answer.actions.map(a=>`<h3>${a.title}</h3><p>${a.description}</p>`).join("")}`);w.document.close();w.print();}
 return <main className="bai-shell">
  <section className="bai-hero"><div><span>SAQSO.AI / TENANT INTELLIGENCE</span><h1>Business AI Advisor</h1><p>Real data. Clear evidence. Practical execution plans.</p></div><div className="bai-health"><b>AI Ready</b><small>Bangla · English · Banglish</small></div></section>
  <section className="bai-grid">
   <aside className="bai-side"><h3>Ask about your business</h3>{prompts.map(p=><button key={p} onClick={()=>send(p)}>{p}</button>)}<div className="bai-note">AI never applies campaigns, prices, budgets or database changes without approval.</div></aside>
   <div className="bai-chat">
    <div className="bai-messages">{messages.map(m=><article key={m.id} className={`bai-message ${m.role}`}><div className="bai-avatar">{m.role==="assistant"?"AI":"YOU"}</div><div><p>{m.text}</p>{m.answer&&<><div className="bai-confidence">Confidence {Math.round(m.answer.confidence*100)}%</div><div className="bai-evidence">{m.answer.evidence.map(e=><div key={e.key}><span>{e.label}</span><b>{e.value}</b><small>{e.source}</small></div>)}</div><div className="bai-actions">{m.answer.actions.map(a=><div key={a.id}><b>{a.title}</b><p>{a.description}</p><small>{a.owner} · {a.dueInDays} days · {a.priority}</small></div>)}</div><div className="bai-tools"><button onClick={()=>speak(m.text)}>🔊 Listen</button><button onClick={()=>printAnswer(m.answer!)}>🖨 Print plan</button></div></>}</div></article>)}{loading&&<div className="bai-thinking">Analyzing real store signals…</div>}<div ref={bottom}/></div>
    <div className="bai-composer"><button onClick={startVoice} className={voice?"listening":""}>🎙</button><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="বাংলা, English বা Banglish-এ business question লিখুন…"/><button onClick={()=>send()}>Send ➜</button></div>
   </div>
  </section>
 </main>
}
