import { IconButton } from "./iconButton";
import { useState, useEffect, useRef } from "react";

import { useAtomValue, useSetAtom } from "jotai";
import { isSpeakingAtom } from "@/features/messages/speakCharacter";
type Props = {
  userMessage: string;
  isMicRecording: boolean;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClickSendButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickMicButton: (event?: React.MouseEvent<HTMLButtonElement>) => void;
};
export const MessageInput = ({
  userMessage,
  isMicRecording,
  isChatProcessing,
  onChangeUserMessage,
  onClickMicButton,
  onClickSendButton,
}: Props) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent the default action to avoid form submission if wrapped in a form
      onClickSendButton(
        event as unknown as React.MouseEvent<HTMLButtonElement>
      );
    }
  };
  // State to manage microphone toggle independently
  const [micToggled, setMicToggled] = useState(false);
  const isSpeaking = useAtomValue(isSpeakingAtom);
  const setIsSpeaking = useSetAtom(isSpeakingAtom);
  const isSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
    console.log("Updated isSpeaking state:", isSpeaking);
  }, [isSpeaking]);
  const handleToggleMicButton = () => {
    setMicToggled((current) => !current); // Toggle state
  };

  // Effect to re-trigger mic toggle when chat processing finishes
  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;

    // Only set up the timeout when isSpeaking changes to false
    if (!isSpeaking) {
      timer = setTimeout(() => {
        // Check other conditions inside the timeout
        if (!isChatProcessing && !isMicRecording && micToggled) {
          onClickMicButton(); // Execute function after the delay only if conditions still hold
        }
      }, 1000); // Delay set to 1000 milliseconds (1 second)
    }

    // Clean up function that clears the timeout if dependencies change or if isSpeaking turns true
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    isChatProcessing,
    isMicRecording,
    micToggled,
    onClickMicButton,
    isSpeaking, // Ensure this dependency is here to trigger effect on its change
  ]);

  return (
    <div className="absolute bottom-0 z-20 w-screen">
      <div className="bg-base text-black">
        <div className="mx-auto max-w-5xl p-16">
          <div className="grid grid-flow-col gap-[8px] grid-cols-[min-content_1fr_min-content]">
            <div className="flex justify-center">
              <IconButton
                iconName="24/Microphone"
                className={`mx-4 bg-primary hover:bg-primary-hover active:bg-primary-press disabled:bg-[primary]-disabled ${
                  micToggled ? "bg-black hover:bg-primary-hover" : "bg-gray-400"
                } `}
                isProcessing={isMicRecording}
                disabled={isChatProcessing || isSpeaking}
                onClick={handleToggleMicButton}
                label={"Toggle"}
              ></IconButton>

              <IconButton
                iconName="24/Microphone"
                className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
                isProcessing={isMicRecording}
                disabled={isChatProcessing || isSpeaking}
                onClick={onClickMicButton}
              />
            </div>
            <input
              type="text"
              placeholder="Please say something..."
              onChange={onChangeUserMessage}
              onKeyDown={handleKeyDown}
              disabled={isChatProcessing || isSpeaking}
              className="bg-surface1 hover:bg-surface1-hover focus:bg-surface1 disabled:bg-surface1-disabled disabled:text-primary-disabled rounded-16 w-full px-16 text-text-primary typography-16 font-bold disabled"
              value={userMessage}
            ></input>

            <IconButton
              iconName="24/Send"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
              isProcessing={isChatProcessing}
              disabled={isChatProcessing || !userMessage || isSpeaking}
              onClick={onClickSendButton}
            />
          </div>
        </div>
        <div className="py-4 bg-[#413D43] text-center text-white font-Montserrat">
          powered by VRoid, Koemotion, ChatGPT API
        </div>
      </div>
    </div>
  );
};
