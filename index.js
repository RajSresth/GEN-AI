import { GoogleGenAI } from "@google/genai";
import readline from "readline-sync";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({});

async function main() {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    history: [],
  });

  while (true) {
    const query = readline.question("\nAsk me anything: ");

    if (query.toLowerCase() === "exit" || query.toLowerCase() === "clear") {
      break;
    }

    const result = await chat.sendMessageStream({
      message: query,
    });

    // ! Error
    for await (const chunk of result.stream) {
      // In the newest SDK, chunk.text is often a property or method
      const chunkText = chunk.text();
      if (chunkText) {
        process.stdout.write(chunkText);
      }
    }

    console.log("\n");
  }
}

await main();
