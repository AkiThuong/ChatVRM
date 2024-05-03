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
      "Content-Type": "application/json",
      "xi-api-key": process.env.ELEVEN_LAB_TTS_API_KEY || "", // Provide a fallback empty string
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
    console.log("Request: ", {
      text: message,
      voice_settings: voiceSettings,
    });

    const externalResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_model}?optimize_streaming_latency=4`,
      options
    );

    if (externalResponse.ok && externalResponse.body) {
      externalResponse.body.pipe(res);
    } else if (externalResponse.body) {
      // Even though there's a body, the response was not OK.
      const errorText = await externalResponse.text(); // Get textual error message if any.
      console.error("API error:", errorText);
      res.status(externalResponse.status).json({ error: errorText });
    } else {
      // No body in response.
      console.error("API failed with status:", externalResponse.status);
      res
        .status(500)
        .json({ error: "API call failed, no response data received." });
    }
  } catch (error) {
    console.error("API error:", error);
    res
      .status(500)
      .json({ error: "Failed to process the text-to-speech request" });
  }
}
