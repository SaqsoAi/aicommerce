export function voiceSession(input:any){return {provider:"BROWSER_SPEECH_API",language:String(input.language??"auto"),transcript:String(input.transcript??""),voiceReply:Boolean(input.voiceReply),serverAudio:false};}
export function memoryPolicy(){return {projectMemory:true,sessionRecovery:true,approvalRequired:true,autoApply:false};}
