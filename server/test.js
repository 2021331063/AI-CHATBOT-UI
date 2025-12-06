import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello world" }],
    });

    console.log("OpenAI response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
