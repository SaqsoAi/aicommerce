type ChatbotMemoryItem = {
  userId?: string;
  sessionId?: string;
  messages?: unknown[];
  preferences?: Record<string, unknown>;
};


import { memoryAI } from "./memory.ai";

type ChatResponse = {
  reply: string;
};

export const chatbotEngine = {
  /**
   * Main chatbot processor
   */
  async chat(
    userId: string,
    message: string
  ): Promise<ChatResponse> {
    const msg = message.toLowerCase();

    const memories =
      typeof memoryAI.getAll === "function"
        ? memoryAI.getAll()
        : [];

    const memory = memories.find(
      (item: ChatbotMemoryItem) => item.userId === userId
    );

    // Price queries
    if (msg.includes("price")) {
      return {
        reply:
          "Prices vary by product category.",
      };
    }

    // Order queries
    if (msg.includes("order")) {
      return {
        reply:
          "You can track your order from the dashboard.",
      };
    }

    // Discount queries
    if (msg.includes("discount")) {
      return {
        reply:
          "Check the current campaigns page for available discounts.",
      };
    }

    // Style preference
    if (msg.includes("shirt")) {
      return {
        reply: `You liked ${
          memory?.style ?? "casual"
        } style shirts.`,
      };
    }

    // Size preference
    if (msg.includes("size")) {
      return {
        reply: `Your preferred size is ${
          memory?.size ?? "M"
        }.`,
      };
    }

    return {
      reply:
        "I am your AI shopping assistant. Ask me anything!",
    };
  },
};

/**
 * Legacy compatibility export
 */
export const chatbotResponse = async (
  message: string
): Promise<string> => {
  const result =
    await chatbotEngine.chat(
      "guest",
      message
    );

  return result.reply;
};

/**
 * Legacy compatibility export
 */
export const chatbotBrain = async (
  userId: string,
  message: string
): Promise<string> => {
  const result =
    await chatbotEngine.chat(
      userId,
      message
    );

  return result.reply;
};
