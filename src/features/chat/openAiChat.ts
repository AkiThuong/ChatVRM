import { Configuration, OpenAIApi } from "openai";
import { Message } from "../messages/messages";
import { Groq } from "groq-sdk";

// const groq = new Groq({
//     apiKey: "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"
// });
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
    model: "gpt-4o",
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

  messages = messages.slice(-20);
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer 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`,
  };
  function getCurrentWeather(location: string, unit: string = "fahrenheit") {
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
  async function getLunchData(userName: string = "") {
    // Preparing the body data
    const body = {
      userName,
    };

    try {
      // Sending the POST request to the server
      const res = await fetch("/api/checkLunch", {
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
  async function getUserNameList(name: string = "") {
    const data = [
      { fullname: "Yong Yan Yu", userName: "Yan Yu" },
      { fullname: "Nick Paxton", userName: "Nick" },
      { fullname: "Tom Waller", userName: "Tom" },
      { fullname: "Christopher Gan", userName: "Christ" },
      { fullname: "Jennifer Ang", userName: "Jennifer" },
      { fullname: "Kentaro Yuasa", userName: "Yuasa-san" },
      { fullname: "Kevin Cheo Seng Choon", userName: "Kevin" },
      { fullname: "Lau Pei Ti (Betty)", userName: "Betty" },
      { fullname: "Lee Jun Yu", userName: "Lee Jun Yu" },
      { fullname: "Li Yueh Ong", userName: "Li Yueh Ong" },
      { fullname: "Misato Gozu", userName: "Gozu-san" },
      { fullname: "Siew Peng Lee", userName: "Siewpeng" },
      { fullname: "Trisha Ng", userName: "Trisha" },
      { fullname: "Neo Kai Ling", userName: "Kai Ling" },
      { fullname: "John Stone", userName: "John Stone" },
      { fullname: "AN SUK CHOE (Ann)", userName: "Ann" },
      { fullname: "JAEMYEONG KIM (JaeMyeong)", userName: "JaeMyeong" },
      { fullname: "LEE EUN YOUNG (Molly)", userName: "Molly" },
      { fullname: "MOON SUN CHOI (Stephanie)", userName: "Stephanie" },
      { fullname: "SON JAE YOUNG (Jason)", userName: "Jason" },
      { fullname: "YOUNGDAE KIM (Youngdae)", userName: "Youngdae" },
      { fullname: "Robert Hordijk", userName: "Robert Hordijk" },
      { fullname: "Roger Knops", userName: "Roger" },
      { fullname: "Zeal Liew", userName: "Zeal Liew" },
      { fullname: "John Bijin Jabaraj", userName: "JJ" },
      { fullname: "Helen Wong", userName: "Helen" },
      { fullname: "Matthew Ding", userName: "Matthew" },
      { fullname: "Sergio Marques", userName: "Sergio" },
      { fullname: "Robert Mazzocco", userName: "Robert Mazzocco" },
      { fullname: "Justine Hung", userName: "Justine" },
      { fullname: "Aaron JK Lim", userName: "Aaron" },
      { fullname: "Heri Kim", userName: "Heri" },
      { fullname: "Jeonggeun Gu", userName: "Gu" },
      { fullname: "Woohyung Park", userName: "Woohyung" },
      { fullname: "Soonick Hong", userName: "Soonick" },
      { fullname: "Jaeseok Park", userName: "Jaeseok Park" },
      { fullname: "Gordon Ng", userName: "Gordon" },
      { fullname: "Hon Keung Jim", userName: "Hon Keung Jim" },
      { fullname: "Huynh Van Tan", userName: "Tan" },
      { fullname: "Lavina", userName: "Lavina" },
      { fullname: "Kazuya", userName: "Kazuya" },
      { fullname: "Cong Canh Le", userName: "Cong Canh Le" },
      { fullname: "Cong Hoi Phan", userName: "Cong Hoi Phan" },
      { fullname: "Aki (Thuong) Huynh", userName: "Aki" },
      { fullname: "Marcus (Thinh) Do", userName: "Marcus" },
      { fullname: "Hector (Hai) To", userName: "Hector" },
      { fullname: "Yahiko (Bao) Dinh", userName: "Yahiko" },
      { fullname: "Alex (Thien) Nguyen", userName: "Alex" },
      { fullname: "Harry (Khanh) Duong", userName: "Harry" },
      { fullname: "Louis (Huy) Nguyen", userName: "Louis" },
      { fullname: "Levi (Lich) Hoang", userName: "Levi" },
      { fullname: "Victor (Vinh) Vo", userName: "Victor" },
      { fullname: "Cody (Thinh) Huynh", userName: "Cody" },
      { fullname: "Hutson (Huy) Nguyen", userName: "Hutson" },
      { fullname: "Joey (Phi) Tran", userName: "Joey" },
      { fullname: "Paul (Nhat) Quach", userName: "Paul" },
      { fullname: "Daniel (Nguyen) Nguyen", userName: "Daniel" },
      { fullname: "Cyan (Bao) Nguyen", userName: "Cyan" },
      { fullname: "Kai (Linh) Tran", userName: "Kai" },
      { fullname: "Otis (Quoc) Nguyen", userName: "Otis" },
      { fullname: "Jade (Nhien) Chau", userName: "Jade" },
      { fullname: "Annie (Thu) Nguyen", userName: "Annie" },
      { fullname: "Lennon (Dat) Bui", userName: "Lennon" },
      { fullname: "Jun (Tuan) Dang", userName: "Jun" },
      { fullname: "Quinn (Quynh) Nguyen", userName: "Quinn" },
      { fullname: "Peter (Long) Nguyen", userName: "Peter" },
      { fullname: "Evan (Hien) Ho", userName: "Evan" },
      { fullname: "Selena (Hien) Nguyen", userName: "Selena" },
      { fullname: "Jan (Giang) Nguyen", userName: "Jan" },
      { fullname: "Kiko (Kim) Tran", userName: "Kiko" },
      { fullname: "Tommy (Tho) Nguyen", userName: "Tommy" },
      { fullname: "An (Ann) Banh", userName: "An Banh" },
      { fullname: "Huy (Henry) Doan", userName: "Henry" },
      { fullname: "Phoebe (Phuc) Nguyen", userName: "Phoebe" },
      { fullname: "Hien (Hillary) Nguyen", userName: "Hillary" },
      { fullname: "Cong (Cico) Vo", userName: "Cico" },
      { fullname: "Lila (Anh) Nguyen", userName: "Lila" },
      { fullname: "Phillip (Phuc) Nguyen", userName: "Phillip" },
      { fullname: "Nik (Nhan) Nguyen", userName: "Nik" },
      { fullname: "Rosezy (Tran) Huynh", userName: "Rosezy" },
      { fullname: "Scott (Duc) Nguyen", userName: "Scott" },
      { fullname: "Jake (Phuong) Tran", userName: "Jake" },
      { fullname: "Jolie (Tram) Nguyen", userName: "Jolie" },
      { fullname: "Vision (Viet) Nguyen", userName: "Vision" },
      { fullname: "Janet (Uyen) Vo", userName: "Janet" },
      { fullname: "Yong Jin Yu", userName: "Yong Jin Yu" },
      { fullname: "Tu Nguyen", userName: "Tu Nguyen" },
    ];
    console.log("Namelist", data);
    return JSON.stringify(data); // Converting data back to JSON string if needed elsewhere
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
        name: "get_lunch_data",
        description: "Find Lunch Option of certain user for today",
        parameters: {
          type: "object",
          properties: {
            userName: {
              type: "string",
              description:
                "Username, Leave it blank if not specified, only add Human Name, e.g. 'Aki'",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_user_name",
        description: "Get the list of userNames in the system",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Search Name, Leave it blank if not specified",
            },
          },
        },
      },
    },
  ];

  // const headers: Record<string, string> = {
  //   "Content-Type": "application/json",
  //   Authorization: `Bearer ${apiKey}`,
  // };
<<<<<<< Updated upstream

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        ...messages,
        { role: "system", content: `Today: ${getTodayDateTime()}` },
      ],
      stream: true,
      max_tokens: 200,
    }),
  });
=======
  messages = [
    ...messages,
    {
      role: "system",
      content: `Today: ${getTodayDateTime()}. You are talking with ${currentUser}`,
    },
  ];
  console.log(messages);
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      headers: headers,
      method: "POST",
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: messages,
        max_tokens: 3000,
        tools: tools,
        tool_choice: "auto",
      }),
    }
  );
  const returnData = await response.json();
  const responseMessage = returnData.choices[0].message;
  const toolCalls = responseMessage.tool_calls;
  console.log("toolCalls", toolCalls);
  if (responseMessage.tool_calls) {
    const availableFunctions: any = {
      get_current_weather: getCurrentWeather,
      get_timeline_data: getLunchData,
      get_user_name_list: getUserNameList,
    };
    if (responseMessage.content !== null) {
      messages.push(responseMessage);
    }
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      try {
        // Check if function is async and await its result
        let functionResponse: any;
        // Determine the correct arguments based on the function name
        if (functionName === "get_current_weather") {
          // Assuming getCurrentWeather function takes 'location' and 'unit' as arguments
          functionResponse = await functionToCall(
            functionArgs.location,
            functionArgs.unit
          );
        } else if (functionName === "get_lunch_data") {
          functionResponse = await functionToCall(functionArgs.ownerFilter);
        } else if (functionName === "get_user_name") {
          functionResponse = await functionToCall(functionArgs.name);
        } else {
          throw new Error("Unknown function called");
        }
        if (functionResponse !== null) {
          messages.push({
            tool_call_id: toolCall.id,
            role: "function",
            name: functionName,
            content: functionResponse,
          });
        }
      } catch (error) {
        console.error(`Error calling function ${functionName}:`, error);
        // Handle error or push an error message to the messages array
      }
    }
  }
  console.log("responseMessage", responseMessage);
  // messages.push(responseMessage);
  console.log("messages", messages);
>>>>>>> Stashed changes

  // const res = await fetch("https://api.openai.com/v1/chat/completions", {
  //   headers: headers,
  //   method: "POST",
  //   body: JSON.stringify({
  //     model: "gpt-4o",
  //     messages: [
  //       ...messages,
  //       { role: "system", content: `Today: ${getTodayDateTime()}` },
  //     ],
  //     stream: true,
  //     max_tokens: 200,
  //   }),
  // });

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: messages,
      stream: true,
      max_tokens: 200,
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
          console.log("data", data);
          const chunks = data
            ? data
                .replace(/^data: /gm, "")
                .split("\n")
                .filter((c) => Boolean(c.length) && c !== "[DONE]")
                .map((c) => {
                  try {
                    return JSON.parse(c); // Attempt to parse JSON
                  } catch (e) {
                    console.error("Failed to parse JSON, skipping:", c);
                    return null; // Return null if JSON is malformed
                  }
                })
                .filter((c) => c !== null) // Remove null entries (malformed JSON)
            : [];
          for (const chunk of chunks) {
            const messagePiece = chunk.choices[0].delta.content; // Directly use chunk as an object
            if (!!messagePiece) {
              controller.enqueue(messagePiece);
            }
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return stream;
}
