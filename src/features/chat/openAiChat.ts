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
  apiKey: string,
  currentUser: string
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

  // const headers: Record<string, string> = {
  //   "Content-Type": "application/json",
  //   Authorization: `Bearer ${apiKey}`,
  // };
  messages = [
    ...messages,
    {
      role: "system",
      content: `Today: ${getTodayDateTime()}. You are talking with ${currentUser}`,
    },
  ];
  console.log(messages);
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
