import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateDescription = async (name: string) => {
  try {
    console.log("OPENAI KEY:", !!process.env.OPENAI_API_KEY);

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Write a luxury ecommerce product description for ${name}`,
        },
      ],
    });

    console.log("AI Response Success");

    return res.choices?.[0]?.message?.content;
  } catch (error: any) {
    console.error("OPENAI FULL ERROR:");
    console.error(error);

    if (error?.status) {
      console.error("Status:", error.status);
    }

    if (error?.message) {
      console.error("Message:", error.message);
    }

    throw error;
  }
};