import { GoogleGenAI } from "@google/genai";
import readline from "readline-sync"
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({});

async function main() {
  const query = readline.question("Ask me anything:");

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    history: []
  }) 

  const response = await chat.sendMessage({
    message: query,
  });
  console.log("Chat response 1:", response.text);

  while(true)
  { 
    const query = readline.question("\nAsk me anything: ");

    if(query.toLowerCase() === "exit" || query.toLowerCase() === "clear")
    {
      console.log("Good Bye...!");
      break;
    }

    const response = await chat.sendMessage({
        message: query,
      });

    console.log("\nChat response:", response.text);
  }
}

await main();
