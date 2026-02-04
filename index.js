import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({});

// const history = [
//     {
//       role: "user",
//       parts: [{ text: "what is my name and age?" }],
//     },
//     {
//       role:"model",
//       parts:[{text:"I don’t know your name or age."}]
//     },
//     {
//       role:"user",
//       parts:[{text:"my name is Shresth rajput"}]
//     },
//     {
//       role:"model",
//       parts:[{text:"Nice to meet you, **Shresth Rajput**!"}]
//     },
//     {
//       role:"user",
//       parts:[{text:"what is my name?"}]
//     }
// ]

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "explain what is react usestate hook?",
    config: {
      systemInstruction:
        "You are a food Ordering Website. You only answer questions related to food,near by restaurants, recipes, and nutrition.",
    },
  });

  console.log(response.text);
}

await main();
