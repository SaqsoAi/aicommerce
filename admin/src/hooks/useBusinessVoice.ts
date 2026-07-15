"use client";
import { useCallback, useRef, useState } from "react";

export function useBusinessVoice(){
 const recognition=useRef<any>(null);
 const [listening,setListening]=useState(false);
 const supported=typeof window!=="undefined"&&Boolean((window as any).SpeechRecognition||(window as any).webkitSpeechRecognition);
 const listen=useCallback((onText:(text:string)=>void,language="bn-BD")=>{
  const Ctor=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!Ctor)return false;
  const r=new Ctor(); recognition.current=r; r.lang=language;r.continuous=false;r.interimResults=true;
  r.onstart=()=>setListening(true);r.onend=()=>setListening(false);r.onerror=()=>setListening(false);
  r.onresult=(e:any)=>onText(Array.from(e.results).map((x:any)=>x[0].transcript).join(""));
  r.start();return true;
 },[]);
 const stop=useCallback(()=>recognition.current?.stop(),[]);
 const speak=useCallback((text:string)=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=/[\u0980-\u09FF]/.test(text)?"bn-BD":"en-US";speechSynthesis.speak(u);},[]);
 return {supported,listening,listen,stop,speak};
}
