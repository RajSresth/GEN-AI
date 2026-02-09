import { GoogleGenAI, Type } from "@google/genai";
import readline from "readline-sync";
import dotenv from "dotenv";
dotenv.config();


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// 2. The Tool Function
async function weatherInformation({location}) {
    const url = `http://api.weatherapi.com/v1/current.json?key=ce7051ff107c4605a7371506240404&q=${location}&aqi=no`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
    
const weatherInfo = {
  name: "weatherInformation",
  description: "Gets the current temperature for a given location.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "Name of the city for which i have to fetch",
      },
    },
    required: ["location"],
  },
};


const tools = [{
  functionDeclarations: [weatherInfo]
}]

const History = []

const toolFunctions = {
  "weatherInformation": weatherInformation
}


async function runAgent()
{
    while(true)
    {
      const result = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: History,
          config: {tools}   
        });


        if(result.functionCalls && result.functionCalls.length > 0)
        {
            const functionCall = result.functionCalls[0];

            const {name,args} = functionCall;
            console.log(name);
            console.log(args);
            const response = await  toolFunctions[name](args)

            console.log(response)

            const functionResponsePart = {
              name: functionCall.name,
              response:{
                result: response
              }
            }

            // Send the function response back to the model
            History.push({
              role:"model",
              parts:[
                {
                  functionCall:functionCall
                }
              ]
            })

            History.push({
              role:"user",
              parts:[
                {
                  functionResponse:functionResponsePart
                }
              ]
            })
        }
        else{

          History.push({
            role:"model",
            parts: [{text: result.text}]
          });

          console.log(response.text)
          break;
        }
          
    }
}

while (true) {
  const question = readline.question("Ask me anything:");

  if(question === "exit"){
    break;
  }

  History.push({
    role:"user",
    parts:[{text:question}]
  });

  await runAgent()
}
