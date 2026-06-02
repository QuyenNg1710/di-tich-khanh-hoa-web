"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DescriptionSpeakerProps {
  text: string;
  variant?: "button" | "widget";
}

export default function DescriptionSpeaker({ text, variant = "button" }: DescriptionSpeakerProps) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioCache, setAudioCache] = useState<{ text: string; url: string } | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
    const audio = audioRef.current;

    return () => {
      abortRef.current?.abort();

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  function stopPlayback() {
    abortRef.current?.abort();
    abortRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setLoading(false);
    setSpeaking(false);
  }

  function getVietnameseVoice() {
    return (
      voices.find((voice) => voice.lang.toLowerCase() === "vi-vn") ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("vi")) ||
      voices.find((voice) => /vietnam|vietnamese|vi-vn/i.test(`${voice.name} ${voice.lang}`))
    );
  }

  function speakWithBrowserVoice(content: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
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

  async function createVietnameseAudio(content: string) {
    const controller = new AbortController();
    abortRef.current = controller;

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: content }),
      signal: controller.signal,
    });

    const data = (await response.json().catch(() => ({}))) as { audioUrl?: string; error?: string };

    if (!response.ok || !data.audioUrl) {
      throw new Error(data.error || "Không thể tạo giọng đọc tiếng Việt.");
    }

    return data.audioUrl;
  }

  async function handleSpeak() {
    const content = text.trim();

    if (!content || typeof window === "undefined") {
      return;
    }

    if (speaking || loading) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setLoading(true);

    try {
      const nextAudioUrl = audioCache?.text === content
        ? audioCache.url
        : await createVietnameseAudio(content);
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      setAudioCache({ text: content, url: nextAudioUrl });
      audio.src = nextAudioUrl;
      audio.currentTime = 0;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);

      setLoading(false);
      setSpeaking(true);
      await audio.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("TTS audio failed, falling back to browser speech:", error);
      setLoading(false);
      speakWithBrowserVoice(content);
    } finally {
      abortRef.current = null;
    }
  }

  if (!text.trim()) {
    return null;
  }

  if (variant === "widget") {
    const statusText = loading
      ? "Đang tạo giọng đọc tiếng Việt..."
      : speaking
        ? "Đang phát thuyết minh..."
        : "Trải nghiệm hướng dẫn viên ảo";

    return (
      <div className="bg-gradient-to-br from-teal-50/80 to-emerald-50/30 dark:from-teal-950/20 dark:to-emerald-950/10 border border-teal-100/80 dark:border-teal-900/50 rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 dark:opacity-10 text-teal-800">
          <Headphones size={120} />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400">
              <Headphones className="size-4" />
            </span>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              Audio Guide
            </span>
          </div>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold bg-teal-100/50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">
            Giọng nói AI
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed relative z-10">
          Nghe bản thuyết minh chi tiết về di tích lịch sử này bằng giọng thuyết minh tiếng Việt tự động.
        </p>

        <div className="flex items-center gap-4 pt-2 relative z-10">
          <Button
            type="button"
            onClick={handleSpeak}
            className="h-11 w-11 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer border-0"
            aria-label={speaking || loading ? "Dừng đọc" : "Nghe thuyết minh"}
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : speaking ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current ml-0.5" />
            )}
          </Button>

          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {statusText}
            </span>

            <div className="mt-1 flex items-center gap-0.5 h-4">
              {speaking || loading ? (
                <>
                  <span className="w-[3px] bg-teal-600 dark:bg-teal-500 rounded-full animate-sound-wave-1 h-1.5" />
                  <span className="w-[3px] bg-teal-600 dark:bg-teal-500 rounded-full animate-sound-wave-2 h-3" />
                  <span className="w-[3px] bg-teal-600 dark:bg-teal-500 rounded-full animate-sound-wave-3 h-1" />
                  <span className="w-[3px] bg-teal-600 dark:bg-teal-500 rounded-full animate-sound-wave-4 h-4" />
                  <span className="w-[3px] bg-teal-600 dark:bg-teal-500 rounded-full animate-sound-wave-5 h-2" />
                </>
              ) : (
                <>
                  <span className="w-[3px] h-2 bg-teal-400/40 rounded-full" />
                  <span className="w-[3px] h-3 bg-teal-400/40 rounded-full" />
                  <span className="w-[3px] h-1.5 bg-teal-400/40 rounded-full" />
                  <span className="w-[3px] h-4 bg-teal-400/40 rounded-full" />
                  <span className="w-[3px] h-2 bg-teal-400/40 rounded-full" />
                </>
              )}
            </div>
          </div>
        </div>

        <audio ref={audioRef} preload="none" className="hidden" />

        <style>{`
          @keyframes soundWave {
            0%, 100% { height: 6px; }
            50% { height: 16px; }
          }
          .animate-sound-wave-1 { animation: soundWave 0.8s ease-in-out infinite; }
          .animate-sound-wave-2 { animation: soundWave 0.5s ease-in-out infinite; }
          .animate-sound-wave-3 { animation: soundWave 0.7s ease-in-out infinite; }
          .animate-sound-wave-4 { animation: soundWave 0.6s ease-in-out infinite; }
          .animate-sound-wave-5 { animation: soundWave 0.9s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={speaking || loading ? "Dừng đọc mô tả" : "Nghe mô tả"}
      onClick={handleSpeak}
      className="rounded-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
    >
      <audio ref={audioRef} preload="none" className="hidden" />
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : speaking ? (
        <VolumeX className="size-4" />
      ) : (
        <Volume2 className="size-4" />
      )}
    </Button>
  );
}
