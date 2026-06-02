import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EVERAI_TTS_URL = "https://www.everai.vn/api/v1/tts";
const DEFAULT_VOICE_CODE = "vi_female_kieunhi_mn";
const POLL_ATTEMPTS = 10;
const POLL_DELAY_MS = 1000;
const GOOGLE_TTS_CHUNK_LENGTH = 180;
const MAX_TTS_LENGTH = 5000;

type EverAiResponse = {
  status?: number;
  error_message?: string;
  result?: {
    request_id?: string;
    status?: string;
    progress?: number;
    audio_link?: string;
    audio_expired?: boolean;
  };
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readEverAiResponse(response: Response) {
  return (await response.json().catch(() => ({}))) as EverAiResponse;
}

function isReadyStatus(status?: string) {
  return ["done", "success", "completed", "complete"].includes(status?.toLowerCase() ?? "");
}

function splitTextIntoChunks(text: string) {
  const cleanText = text.replace(/\s+/g, " ").trim().slice(0, MAX_TTS_LENGTH);
  const sentences = cleanText.match(/[^.!?;:。！？;:]+[.!?;:。！？;:]?/g) ?? [cleanText];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const value = sentence.trim();
    if (!value) continue;

    if ((current + " " + value).trim().length <= GOOGLE_TTS_CHUNK_LENGTH) {
      current = (current + " " + value).trim();
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (value.length <= GOOGLE_TTS_CHUNK_LENGTH) {
      current = value;
      continue;
    }

    const words = value.split(" ");
    current = "";

    for (const word of words) {
      if ((current + " " + word).trim().length <= GOOGLE_TTS_CHUNK_LENGTH) {
        current = (current + " " + word).trim();
      } else {
        if (current) chunks.push(current);
        current = word;
      }
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

async function createEverAiAudio(text: string) {
  const voiceKey = process.env.VOICE_KEY;

  if (!voiceKey) {
    throw new Error("Chưa cấu hình VOICE_KEY trên server.");
  }

  const createResponse = await fetch(EVERAI_TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${voiceKey}`,
    },
    body: JSON.stringify({
      response_type: "indirect",
      input_text: text.slice(0, MAX_TTS_LENGTH),
      voice_code: DEFAULT_VOICE_CODE,
      audio_type: "mp3",
      bitrate: 128,
      speed_rate: 1.0,
      pitch_rate: 1.0,
      volume: 100,
    }),
  });

  const createData = await readEverAiResponse(createResponse);

  if (!createResponse.ok || createData.status !== 1) {
    throw new Error(createData.error_message || "Không thể tạo yêu cầu giọng nói EverAI.");
  }

  if (createData.result?.audio_link) {
    return createData.result.audio_link;
  }

  const requestId = createData.result?.request_id;

  if (!requestId) {
    throw new Error("EverAI không trả về mã yêu cầu giọng nói.");
  }

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      await delay(POLL_DELAY_MS);
    }

    const resultResponse = await fetch(`${EVERAI_TTS_URL}/${requestId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${voiceKey}`,
      },
    });
    const resultData = await readEverAiResponse(resultResponse);
    const result = resultData.result;

    if (!resultResponse.ok || resultData.status !== 1) {
      continue;
    }

    if (result?.audio_link && !result.audio_expired && isReadyStatus(result.status)) {
      return result.audio_link;
    }

    if (result?.audio_link && !result.audio_expired && (result.progress ?? 0) >= 100) {
      return result.audio_link;
    }
  }

  throw new Error("EverAI đang xử lý giọng nói, vui lòng thử lại sau vài giây.");
}

async function createGoogleAudioDataUrl(text: string) {
  const chunks = splitTextIntoChunks(text);
  const audioParts: Uint8Array[] = [];

  for (const chunk of chunks) {
    const url = new URL("https://translate.google.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("q", chunk);
    url.searchParams.set("tl", "vi");
    url.searchParams.set("client", "tw-ob");

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Không thể tạo giọng đọc tiếng Việt dự phòng.");
    }

    const buffer = await response.arrayBuffer();
    audioParts.push(new Uint8Array(buffer));
  }

  const totalLength = audioParts.reduce((total, part) => total + part.byteLength, 0);
  const combinedAudio = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of audioParts) {
    combinedAudio.set(part, offset);
    offset += part.byteLength;
  }

  const base64Audio = Buffer.from(combinedAudio).toString("base64");
  return `data:audio/mpeg;base64,${base64Audio}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Văn bản không hợp lệ." }, { status: 400 });
  }

  try {
    const audioUrl = await createEverAiAudio(text);
    return NextResponse.json({ audioUrl, provider: "everai" });
  } catch (everAiError) {
    console.warn("EverAI TTS failed, using fallback:", everAiError);
  }

  try {
    const audioUrl = await createGoogleAudioDataUrl(text);
    return NextResponse.json({ audioUrl, provider: "google-fallback" });
  } catch (fallbackError) {
    console.error("Fallback TTS failed:", fallbackError);
    return NextResponse.json(
      { error: "Không thể tạo giọng đọc tiếng Việt. Vui lòng kiểm tra VOICE_KEY hoặc kết nối mạng." },
      { status: 502 }
    );
  }
}
