import { GoogleGenAI,Type} from "@google/genai";
import readline from "readline-sync";
import dotenv from "dotenv";
dotenv.config();


const ai = new GoogleGenAI({ });


// 2. The Tool Function
async function weatherInformation({location}) {
  const API_KEY = "fd719c57a14153477b575c89d3c70110";
     const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;  
    const response = await fetch(url);
    const data = await response.json();
    return   {
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };
}


const weatherInfo = {
  name: "weatherInformation",
  description: "Gets the current temperature for a given location.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "Name of the city or state for which i have to fetch",
      }
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
            const toolResponse  = await  toolFunctions[name](args)

            console.log(toolResponse)

            const functionResponsePart = {
              name: functionCall.name,
              response:{
                result: toolResponse 
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

          console.log(result.text)
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

  await runAgent();
}
