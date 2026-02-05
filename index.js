import { GoogleGenAI, Type } from "@google/genai";
import readline from "readline-sync";
import dotenv from "dotenv";
dotenv.config();

// Configure the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the function declaration for the model
const weatherFunctionDeclaration = {
  name: "get_current_temperature",
  description: "Gets the current temperature for a given location.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "The city or state name",
      },
    },
    required: ["location"],
  },
};

// Send request with function declarations
const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: "What's the temperature?",
  config: {
    tools: [
      {
        functionDeclarations: [weatherFunctionDeclaration],
      },
    ],
  },
});

// Check for function calls in the response
if (response.functionCalls && response.functionCalls.length > 0) {
  const functionCall = response.functionCalls[0]; // Assuming one function call
 
 

  // In a real app, you would call your actual function here:
  const result = await getCurrentTemperature(functionCall.args.location);
} else {
  console.log("No function call found in the response.");
  console.log(response.text);
}

async function main() {
  const prompt = readline.question("Ask me anything about weather:");

  // 1. Send request with tools
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ functionDeclarations: [weatherFunctionDeclaration] }],
    },
  });

  // 2. Handle the function call
  if (response.functionCalls && response.functionCalls.length > 0) {
    const call = response.functionCalls[0];
  

    // Execute the local function
    const result = await getCurrentTemperature(call.args.location);

    // 3. (Important) Send the result back to get the final answer
    const finalResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        response.candidates[0].content, // Send the model's call back
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: "get_current_temperature",
                response: result,
              },
            },
          ],
        },
      ],
    });

    console.log("\nFinal Answer:", finalResponse.text);
  } else {
    console.log("\nGemini:",response.text);
  }
}

// 2. The Tool Function
async function getCurrentTemperature(location) {
  try {
    console.log(`Fetching weather for: ${location}...`);
    
    // Ensure we are passing a string to the URL
    const url = `http://api.weatherapi.com/v1/current.json?key=ce7051ff107c4605a7371506240404&q=${encodeURIComponent(location)}&aqi=no`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        return { error: data.error.message };
    }

    // WeatherAPI structure: Name is in 'location', Temp is in 'current'
    return {
      location: data.location.name,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
    };
  } catch (error) {
    console.error("API Error:", error);
    return { error: "Failed to fetch weather data" };
  }
}

main();

/**
 * ! Bug in this code
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
 */
