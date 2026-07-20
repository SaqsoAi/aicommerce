"use client";

import { Bot, LoaderCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductCatalogRecommended } from "@/api/product-catalog.api";
import { usePathname } from "next/navigation";
import { useScrollLock } from "@/lib/scroll-lock";
import { requestAiCustomerExperience } from "@/lib/ai/customerExperience";

type Recommendation = { productId?: string; name: string; reason: string; price?: number; confidence?: number };
type AssistantResponse = { message: string; recommendations: Recommendation[]; data?: { intent?: string } };

export default function SaqsoAiAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<unknown[]>([]);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useScrollLock(open, "saqso-ai-shopping-stylist");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    getProductCatalogRecommended().then((items) => setProducts(Array.isArray(items) ? items : [])).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  async function ask() {
    const query = message.trim();
    if (!query || loading) return;
    setLoading(true); setError("");
    try {
      const response = await requestAiCustomerExperience<AssistantResponse>({ endpoint: "shopping-assistant", payload: { message: query, products, context: { locale: navigator.language, products } } });
      setResult(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "AI assistant is temporarily unavailable.");
    } finally { setLoading(false); }
  }

  return <>
    {open ? <>
      <button type="button" aria-label="Close AI assistant" onClick={()=>setOpen(false)} className="fixed inset-0 z-[88] bg-black/55 backdrop-blur-[2px] sm:bg-black/20" />
      <section role="dialog" aria-modal="true" aria-label="AI shopping assistant" className="fixed inset-x-2 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] z-[90] flex max-h-[68dvh] flex-col overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:bottom-5 sm:left-auto sm:right-5 sm:max-h-[72vh] sm:w-[390px]">
      <header className="flex items-center justify-between bg-black p-4 text-white"><div className="flex items-center gap-2"><Bot size={20}/><div><p className="text-xs font-bold uppercase text-amber-300">AI Assistant</p><h3 className="font-black">Shopping Stylist</h3></div></div><button onClick={()=>setOpen(false)} aria-label="Close AI assistant" className="grid h-11 w-11 place-items-center rounded-md"><X size={20}/></button></header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"><p className="text-sm text-zinc-600 dark:text-zinc-300">Ask for products, outfits, sizes, gifts or checkout help.</p><div className="flex gap-2"><input value={message} onChange={(event)=>setMessage(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter")void ask();}} placeholder="Black polo under 2000" className="min-h-11 min-w-0 flex-1 rounded-md border bg-transparent px-3"/><button onClick={ask} disabled={loading||!message.trim()} aria-label="Ask AI" className="grid h-11 w-11 place-items-center rounded-md bg-black text-white disabled:opacity-50 dark:bg-white dark:text-black">{loading?<LoaderCircle className="animate-spin" size={18}/>:<Send size={18}/>}</button></div>
      {error?<p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>:null}
      {result?<div className="space-y-2"><p className="text-sm font-semibold">{result.message}</p>{result.recommendations?.length?result.recommendations.map((item,index)=><Link key={`${item.productId||item.name}-${index}`} href={item.productId?`/product/${item.productId}`:"/shop"} onClick={()=>setOpen(false)} className="block rounded-md border p-3"><b>{item.name}</b><span className="mt-1 block text-xs text-zinc-500">{item.reason}</span></Link>):<p className="rounded-md border border-dashed p-3 text-sm text-zinc-500">No matching live products found. Try a broader request.</p>}</div>:null}</div>
    </section></>:null}
    {!open ? <button onClick={()=>setOpen(true)} aria-label="Open AI shopping assistant" className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 z-[65] grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-zinc-950 text-white shadow-[0_12px_34px_rgba(0,0,0,.35)] transition active:scale-95 dark:bg-white dark:text-black sm:inline-flex sm:h-12 sm:w-auto sm:gap-2 sm:px-4 md:bottom-5 md:right-5"><Bot size={19}/><span className="hidden sm:inline">AI Stylist</span></button> : null}
  </>;
}
