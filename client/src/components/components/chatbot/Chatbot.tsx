"use client";

import { useState } from "react";

export default function Chatbot() {
  const [message, setMessage] =
    useState("");

  return (
    <div className="fixed bottom-5 right-5">
      <div className="bg-black text-white p-5 rounded-2xl w-[320px]">
        <h2 className="text-xl font-bold mb-4">
          AI Assistant
        </h2>

        <div className="h-[250px] bg-zinc-900 rounded-xl mb-4 p-3">
          AI Chat Messages
        </div>

        <input
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          placeholder="Ask anything..."
          className="w-full p-3 rounded-xl text-black"
        />
      </div>
    </div>
  );
}

