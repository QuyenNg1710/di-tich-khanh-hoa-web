import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EVERAI_TTS_URL = "https://www.everai.vn/api/v1/tts";
const DEFAULT_VOICE_CODE = "vi_female_kieunhi_mn";
const POLL_ATTEMPTS = 10;
const POLL_DELAY_MS = 1000;

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

export async function POST(request: Request) {
  const voiceKey = process.env.VOICE_KEY;

  if (!voiceKey) {
    return NextResponse.json(
      { error: "Chưa cấu hình VOICE_KEY trên server." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Văn bản không hợp lệ." }, { status: 400 });
  }

  const createResponse = await fetch(EVERAI_TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${voiceKey}`,
    },
    body: JSON.stringify({
      response_type: "indirect",
      input_text: text.slice(0, 5000),
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
    return NextResponse.json(
      { error: createData.error_message || "Không thể tạo yêu cầu giọng nói." },
      { status: 502 }
    );
  }

  if (createData.result?.audio_link) {
    return NextResponse.json({ audioUrl: createData.result.audio_link });
  }

  const requestId = createData.result?.request_id;

  if (!requestId) {
    return NextResponse.json(
      { error: "EverAI không trả về mã yêu cầu giọng nói." },
      { status: 502 }
    );
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
      return NextResponse.json({ audioUrl: result.audio_link });
    }

    if (result?.audio_link && !result.audio_expired && (result.progress ?? 0) >= 100) {
      return NextResponse.json({ audioUrl: result.audio_link });
    }
  }

  return NextResponse.json(
    { error: "EverAI đang xử lý giọng nói, vui lòng thử lại sau vài giây." },
    { status: 202 }
  );
}
