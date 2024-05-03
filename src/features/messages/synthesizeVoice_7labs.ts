import { reduceTalkStyle } from "@/utils/reduceTalkStyle";
import { koeiromapV0 } from "../koeiromap/koeiromap";
import { TalkStyle } from "../messages/messages";

export async function synthesizeVoice(
  message: string,
  speakerX: number,
  speakerY: number,
  style: TalkStyle
) {
  const koeiroRes = await koeiromapV0(message, speakerX, speakerY, style);
  return { audio: koeiroRes.audio };
}

export async function ttsStreaming(
  message: string,
  voice_model: string = "gkpVmeUj2dN8UTBY3oUz"
) {
  try {
    const body = {
      message: message,
      voice_model: voice_model,
    };

    const res = await fetch("/api/elevenlabs_tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    return { audio: audioUrl };
  } catch (error) {
    console.error(error);
  }
}
