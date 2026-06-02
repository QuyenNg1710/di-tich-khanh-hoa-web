"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Trash2, X } from "lucide-react";

import chatbotAvatar from "../../../assets/ChatBot.jpg";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Xin chào! Mình là trợ lý hướng dẫn của Di Tích Khánh Hòa. Bạn muốn tìm hiểu di tích, lịch sử hay gợi ý tham quan nào?",
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatPlainText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s*[-*•▪▫►▸]\s+/gm, "")
    .replace(/^\s*[①②③④⑤⑥⑦⑧⑨]\s*/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/[~|]/g, "")
    .replace(/[→⇒]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;

function renderRichText(text: string) {
  return text.split(urlPattern).map((part, index) => {
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all rounded-md bg-teal-100 px-1 py-0.5 font-semibold text-teal-800 underline decoration-amber-400 decoration-2 underline-offset-4 hover:bg-amber-100 hover:text-teal-950"
        >
          {part}
        </a>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function renderAssistantContent(content: string) {
  return (
    <div className="space-y-2">
      {content
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const numberedLine = line.match(/^(\d+\.)\s*(.+)$/);
          const labelLine = line.match(/^([^:]{2,36}):\s*(.+)$/);

          if (numberedLine) {
            return (
              <p
                key={`${line}-${index}`}
                className="rounded-lg border border-teal-100 bg-teal-50/80 px-3 py-2 text-slate-800"
              >
                <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                  {numberedLine[1].replace(".", "")}
                </span>
                {renderRichText(numberedLine[2])}
              </p>
            );
          }

          if (labelLine) {
            return (
              <p
                key={`${line}-${index}`}
                className="rounded-lg border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-slate-800"
              >
                <span className="font-semibold text-teal-800">
                  {labelLine[1]}:
                </span>{" "}
                {renderRichText(labelLine[2])}
              </p>
            );
          }

          return (
            <p key={`${line}-${index}`} className="text-slate-800">
              {renderRichText(line)}
            </p>
          );
        })}
    </div>
  );
}

export function FloatingChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowGreeting(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    scrollAreaRef.current?.scrollTo({
      top: scrollAreaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isOpen]);

  async function sendMessage() {
    const content = input.trim();

    if (!content || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message.id !== "welcome")
            .map((message) => ({
              role: message.role,
              content: message.content,
            })),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Xin lỗi tôi đang bận, vui lòng thử lại sau.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createId(),
          role: "assistant",
          content: formatPlainText(data.reply ?? ""),
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createId(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra, vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[2147483647] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {isOpen ? (
        <section
          aria-label="Hộp chat AI"
          className="flex h-[min(620px,calc(100vh-120px))] w-[calc(100vw-32px)] max-w-[420px] flex-col overflow-hidden rounded-xl border-2 border-teal-500 bg-white shadow-[0_24px_70px_rgba(13,148,136,0.28)] ring-4 ring-amber-300/30"
        >
          <header className="flex items-center gap-3 border-b border-teal-800/20 bg-teal-700 px-4 py-3 text-white">
            <div className="relative size-12 overflow-hidden rounded-full border-2 border-amber-300 bg-white shadow-lg">
              <Image
                src={chatbotAvatar}
                alt="ChatBot"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold">
                Trợ lý hướng dẫn
              </h2>
              <p className="truncate text-xs text-teal-50">
                Hệ thống quản lý di tích Khánh Hoà
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Xóa nội dung chat"
              onClick={() => setMessages([welcomeMessage])}
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Đóng chat"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" />
            </Button>
          </header>

          <div
            ref={scrollAreaRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#f3faf8] px-4 py-4"
          >
            {messages.map((message) => (
              <article
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm leading-6 shadow-sm",
                    message.role === "user"
                      ? "max-w-[84%] bg-teal-700 text-white"
                      : "max-w-[90%] border border-teal-100 bg-white text-slate-800 shadow-teal-900/5"
                  )}
                >
                  {message.role === "assistant" ? (
                    renderAssistantContent(message.content)
                  ) : (
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                </div>
              </article>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  <Loader2 className="size-4 animate-spin text-teal-600" />
                  Đang trả lời...
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-teal-100 bg-white p-3"
          >
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              rows={1}
              className="max-h-28 min-h-10 resize-none border-teal-200 bg-teal-50/60 text-sm focus-visible:border-teal-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon-lg"
              aria-label="Gui tin nhan"
              disabled={!input.trim() || isLoading}
              className="size-10 bg-amber-400 text-slate-950 hover:bg-amber-300"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </section>
      ) : null}

      {showGreeting && !isOpen ? (
        <div className="max-w-[280px] rounded-xl border-2 border-teal-500 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 shadow-[0_16px_45px_rgba(13,148,136,0.24)]">
          Chào mừng đến với hệ thống quản lý di tích tỉnh Khánh Hoà, bạn cần mình giúp gì không ?
        </div>
      ) : null}

      <button
        type="button"
        aria-label={isOpen ? "Đóng chat AI" : "Mở chat AI"}
        onClick={() => setIsOpen((current) => !current)}
        className="group relative flex size-20 items-center justify-center rounded-full border-4 border-white bg-teal-700 shadow-[0_18px_45px_rgba(13,148,136,0.42)] transition hover:-translate-y-1 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
      >
        <span className="absolute -inset-2 rounded-full border-2 border-amber-300/70" />
        <span className="absolute right-1.5 top-1.5 size-4 rounded-full border-2 border-white bg-emerald-400" />
        <span className="relative size-full overflow-hidden rounded-full">
          <Image
            src={chatbotAvatar}
            alt="ChatBot"
            fill
            sizes="80px"
            className="object-cover"
            priority
          />
        </span>
      </button>
    </div>
  );
}
