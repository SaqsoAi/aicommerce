export function businessVoice(input:any){return {language:String(input.language??"auto"),transcript:String(input.transcript??""),mode:"ADVISOR",tenantScoped:true,serverAudio:false};}
