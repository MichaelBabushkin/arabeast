"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  lang?: string;
};

// SpeechRecognition is not in TypeScript's default lib
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SR = any;

export default function MicInput({ onTranscript, disabled, lang = "ar-SA" }: Props) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SR>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setSupported(typeof window !== "undefined" && ("SpeechRecognition" in w || "webkitSpeechRecognition" in w));
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setRecording(false);
  }, []);

  const start = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionImpl = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const text = e.results[0][0].transcript;
      onTranscript(text);
      setRecording(false);
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }, [onTranscript]);

  const toggle = useCallback(() => {
    if (recording) stop();
    else start();
  }, [recording, start, stop]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={recording ? "Stop recording" : "Speak to the Jinn in Arabic"}
      className={[
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition",
        recording
          ? "animate-pulse border border-rose-400/60 bg-rose-500/30"
          : "border border-white/10 hover:border-amber-400/40 hover:bg-white/5",
      ].join(" ")}
    >
      {recording ? (
        <MicOff className="h-4 w-4 text-rose-300" />
      ) : (
        <Mic className="h-4 w-4 text-amber-300/70" />
      )}
    </button>
  );
}
