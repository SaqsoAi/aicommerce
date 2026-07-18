export function enterpriseVoiceSession(input: {
  language?: string;
  transcript?: string;
  interruption?: boolean;
  meetingMode?: boolean;
}) {
  return {
    sessionId: `voice-${Date.now()}`,
    language: String(input.language ?? "bn-BD"),
    transcript: String(input.transcript ?? ""),
    interruptionSupported: true,
    interruptionReceived: Boolean(input.interruption),
    meetingMode: Boolean(input.meetingMode),
    contextRetention: true,
    browserSpeechRecognition: true,
    serverTextToSpeech: false,
    status: "READY",
  };
}
