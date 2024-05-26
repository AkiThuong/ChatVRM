/* eslint-disable */

import type { NextApiRequest, NextApiResponse } from "next/types";
import fetch from "node-fetch";

type Data = {
  audio?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const message = req.body.message;
  const voice_model = req.body.voice_model;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": "136abc74f22e75c91c89344c0e2cccd7" || "", // Provide a fallback empty string
    },
    body: JSON.stringify({
      model_id: "eleven_multilingual_v2",
      text: message,
    }),
  };
  const voiceSettings = {
    stability: 0,
    similarity_boost: 0,
  };
  try {
    const externalResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/Tvjzxp6s1ruQXdfUlU7B?optimize_streaming_latency=4`,
      options
    );

    if (externalResponse.ok && externalResponse.body) {
      externalResponse.body.pipe(res);
    } else {
      // Handle non-OK responses
      const errorText = await externalResponse.text();
      console.error("API error:", errorText);
      res.status(externalResponse.status).json({ error: errorText });
    }
  } catch (error) {
    console.error("Unhandled exception:", error);
    res
      .status(500)
      .json({ error: "Failed to process the text-to-speech request" });
  }
}
