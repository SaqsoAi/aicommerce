import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createEmbedding = async (text: string) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    // ✅ SAFE ACCESS (correct for new SDK)
    const embedding = response.data?.[0]?.embedding;

    if (!embedding) {
      throw new Error("Embedding not returned");
    }

    return embedding;
  } catch (error) {
    console.log("❌ Embedding Error:", error);
    throw error;
  }
};