/* eslint-disable */

import { Configuration, OpenAIApi } from "openai";
import { Message } from "../messages/messages";

export async function getChatResponse(messages: Message[], apiKey: string) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  // ブラウザからAPIを叩くときに発生するエラーを無くすworkaround
  // https://github.com/openai/openai-node/issues/6#issuecomment-1492814621
  delete configuration.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(configuration);

  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const [aiRes] = data.choices;
  const message = aiRes.message?.content || "エラーが発生しました";

  return { message: message };
}

export async function getChatResponseStream(
  messages: Message[],
  apiKey: string
) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  function getCurrentWeather(location, unit = "fahrenheit") {
    if (location.toLowerCase().includes("tokyo")) {
      console.log("Tokyo");
      return JSON.stringify({
        location: "Tokyo",
        temperature: "10",
        unit: "celsius",
      });
    } else if (location.toLowerCase().includes("san francisco")) {
      return JSON.stringify({
        location: "San Francisco",
        temperature: "72",
        unit: "fahrenheit",
      });
    } else if (location.toLowerCase().includes("paris")) {
      return JSON.stringify({
        location: "Paris",
        temperature: "22",
        unit: "fahrenheit",
      });
    } else {
      return JSON.stringify({ location, temperature: "unknown" });
    }
  }
  async function getTimelineData(ownerFilter = "") {
    // Preparing the body data
    const body = {
      ownerFilter,
    };

    try {
      // Sending the POST request to the server
      const res = await fetch("/api/getTimelineData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), // Make sure to stringify the body object
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json(); // Assuming the server responds with JSON
      console.log("data", data);
      return JSON.stringify(data); // Converting data back to JSON string if needed elsewhere
    } catch (error) {
      console.error("Failed to fetch timeline data:", error);
      throw error; // Rethrow after logging to handle it appropriately elsewhere if needed
    }
  }
  function getTodayDateTime() {
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    return `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const tools = [
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_timeline_data",
        description: "Get the timeline data of CLS Staff",
        parameters: {
          type: "object",
          properties: {
            ownerFilter: {
              type: "string",
              description: "Task Owner name",
            },
          },
        },
      },
    },
  ];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        ...messages,
        { role: "system", content: `Today: ${getTodayDateTime()}` },
      ],
      max_tokens: 3000,
      tools: tools,
      tool_choice: "auto",
    }),
  });
  const returnData = await response.json();
  const responseMessage = returnData.choices[0].message;

  // Step 2: check if the model wanted to call a function
  const toolCalls = responseMessage.tool_calls;
  if (responseMessage.tool_calls) {
    const availableFunctions = {
      get_current_weather: getCurrentWeather,
      get_timeline_data: getTimelineData,
      get_today_date_time: getTodayDateTime,
    };
    messages.push(responseMessage);
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      try {
        // Check if function is async and await its result
        let functionResponse;
        // Determine the correct arguments based on the function name
        if (functionName === "get_current_weather") {
          // Assuming getCurrentWeather function takes 'location' and 'unit' as arguments
          functionResponse = await functionToCall(
            functionArgs.location,
            functionArgs.unit
          );
        } else if (functionName === "get_timeline_data") {
          functionResponse = await functionToCall(functionArgs.ownerFilter);
        } else {
          throw new Error("Unknown function called");
        }
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        });
      } catch (error) {
        console.error(`Error calling function ${functionName}:`, error);
        // Handle error or push an error message to the messages array
      }
    }
  }
  console.log("responseMessage", responseMessage);
  // messages.push(responseMessage);
  console.log("messages", messages);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        ...messages,
        { role: "system", content: `Today: ${getTodayDateTime()}` },
      ],
      max_tokens: 200,
      tools: tools,
      stream: true,
      tool_choice: "auto",
    }),
  });

  const reader = res.body?.getReader();
  if (res.status !== 200 || !reader) {
    throw new Error("Something went wrong");
  }
  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const data = decoder.decode(value);
          const chunks = data
            .replaceAll(/^data: /gm, "")
            .split("\n")
            .filter((c) => Boolean(c.length) && c !== "[DONE]")
            .map((c) => JSON.parse(c));

          for (const chunk of chunks) {
            const messagePiece = chunk.choices[0].delta.content;

            if (!!messagePiece) {
              controller.enqueue(messagePiece);
            }
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
        console.log("reader", reader);
        controller.close();
      }
    },
  });

  return stream;
}
