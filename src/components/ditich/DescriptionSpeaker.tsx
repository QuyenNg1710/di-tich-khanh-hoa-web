"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DescriptionSpeakerProps {
  text: string;
}

export default function DescriptionSpeaker({ text }: DescriptionSpeakerProps) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    const loadVoices = () => setVoices(synth.getVoices());

    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);

    return () => {
      synth.cancel();
      synth.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  }, [text]);

  function getVietnameseVoice() {
    return (
      voices.find((voice) => voice.lang.toLowerCase() === "vi-vn") ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("vi")) ||
      voices.find((voice) => /vietnam|vietnamese|vi-vn/i.test(`${voice.name} ${voice.lang}`))
    );
  }

  function handleSpeak() {
    const content = text.trim();

    if (!content || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    const vietnameseVoice = getVietnameseVoice();

    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
    }

    utterance.lang = "vi-VN";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  if (!text.trim()) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={speaking ? "Dừng đọc mô tả" : "Nghe mô tả"}
      onClick={handleSpeak}
      className="rounded-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
    >
      {speaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </Button>
  );
}
