import { wait } from "@/utils/wait";
import { ttsStreaming } from "./synthesizeVoice_7labs";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { Talk } from "./messages";
import { atom, useAtomValue, useSetAtom } from "jotai";
export const isSpeakingAtom = atom(false);

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();
  return (
    screenplay: Screenplay,
    viewer: Viewer,
    koeiroApiKey: string,
    setIsSpeaking: (isSpeaking: boolean) => void,
    isFinalSentence: boolean,
    setIsFinalSentence: (isSpeaking: boolean) => void,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }
      // const hiraganaText = await convertToHiragana(screenplay.talk.message);
      const buffer = await fetchAudio(
        screenplay.talk.message,
        koeiroApiKey
      ).catch(() => null);
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        setIsSpeaking(true);
        onStart?.();
        if (!audioBuffer) {
          setIsSpeaking(false);
          return;
        }
        return viewer.model?.speak(audioBuffer, screenplay);
      }
    );
    prevSpeakPromise.then(() => {
      onComplete?.();
      setIsSpeaking(false);
      console.log("speakCharacter completed");
    });
  };
};

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (
  message: string,
  apiKey: string
): Promise<ArrayBuffer> => {
  const ttsVoice = await ttsStreaming(message, "Tvjzxp6s1ruQXdfUlU7B");
  if (!ttsVoice) {
    throw new Error(
      "ttsVoice is undefined, something went wrong with ttsStreaming."
    );
  }
  const url = ttsVoice.audio;

  if (url == null) {
    throw new Error("Something went wrong, audio URL is null");
  }
  const resAudio = await fetch(url);
  const buffer = await resAudio.arrayBuffer();
  return buffer;
};

async function convertToHiragana(message: string) {
  const body = {
    message: message,
    convertTo: "hiragana",
  };

  try {
    const res = await fetch("/api/kuroshiro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json(); // casting as any removed for clarity
    return { message: data.result };
  } catch (error) {
    console.error("Failed to convert message to Hiragana:", error);
    throw error; // rethrowing the error is optional depending on how you want to handle errors
  }
}
