import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

type Data = {
  audio: string;
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
      "xi-api-key": process.env.ELEVEN_LAB_TTS_API_KEY,
      "Content-Type": "application/json",
    },
    body: `{"model_id":"eleven_multilingual_v2","text":"${message}"}`,
  };
  // If isSpeaking is true, then return early to prevent additional requests
  const voiceSettings = {
    stability: 0,
    similarity_boost: 0,
  };
  try {
    console.log("Request: ", {
      text: message,
      voice_settings: voiceSettings,
    });

    const externalResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_model}?optimize_streaming_latency=4`,
      options
    );

    if (!externalResponse.ok) {
      throw new Error(`HTTP error! Status: ${externalResponse.status}`);
    }

    // Set headers for content type as needed
    res.setHeader("Content-Type", "audio/mpeg");

    // Stream the response
    externalResponse.body.pipe(res); // This should now work with node-fetch
  } catch (error) {
    console.error("API error:", error);
    res
      .status(500)
      .json({ error: "Failed to process the text-to-speech request" });
  }
}
