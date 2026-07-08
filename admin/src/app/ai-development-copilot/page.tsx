import { COPILOT_LOCKED_UI_NOTICE } from "@/lib/ai/developmentCopilot";

export default function AiDevelopmentCopilotPage() {
  return (
    <main>
      <h1>Enterprise AI Development Copilot</h1>
      <p>{COPILOT_LOCKED_UI_NOTICE}</p>
      <p>Use the approved locked UI shell. This placeholder only exposes the functional route if no approved page existed.</p>
    </main>
  );
}
