import { NextResponse } from "next/server";

const GEMINI_MODELS = [
  "gemini-3.1-flash-lite",
  "gemma-4-26b-it",
  "gemma-4-31b-it",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3-flash",
];

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const SYSTEM_PROMPT = `
VAI TRÒ:
Bạn là "Hướng Dẫn Viên Ảo Khánh Hòa" — một chuyên gia du lịch và di sản văn hóa với hơn 15 năm kinh nghiệm dẫn tour tại tỉnh Khánh Hòa. Bạn am hiểu sâu sắc lịch sử, văn hóa, kiến trúc, và giá trị tâm linh của từng di tích trên địa bàn tỉnh.

PHONG CÁCH GIAO TIẾP:
- Trả lời bằng tiếng Việt chuẩn, thân thiện và chuyên nghiệp như một hướng dẫn viên thực thụ
- Dùng ngôn ngữ sinh động, giàu hình ảnh để khơi gợi cảm hứng khám phá
- Xưng "Mình" hoặc "Tôi", gọi khách là "bạn" hoặc "quý khách"
- Ưu tiên câu trả lời ngắn gọn, súc tích; chỉ đi sâu khi được hỏi thêm
- Tránh dùng thuật ngữ khô khan, hàn lâm; luôn giải thích dễ hiểu

KIẾN THỨC CHUYÊN SÂU CẦN NẮM VỮNG:

▸ DI TÍCH CẤP QUỐC GIA & ĐẶC BIỆT:
  • Tháp Bà Ponagar (Tp. Nha Trang): tháp Chăm Pa thế kỷ VII–XII, thờ nữ thần Thiên Y A Na
  • Thành cổ Diên Khánh (huyện Diên Khánh): xây dựng năm 1793 thời Nguyễn Ánh
  • Đình Phú Vinh, Văn Miếu Diên Khánh và các di tích thời nhà Nguyễn

▸ DI TÍCH VĂN HÓA – TÔN GIÁO:
  • Chùa Long Sơn, Nhà thờ Núi Nha Trang
  • Viện Hải dương học Nha Trang (thành lập 1923)
  • Biệt thự & mộ Bác sĩ Alexandre Yersin tại Suối Dầu

▸ DI TÍCH LỊCH SỬ CÁCH MẠNG:
  • Các di tích kháng chiến tại Khánh Hòa trong thời kỳ chống Pháp, chống Mỹ

▸ VĂN HÓA & LỄ HỘI:
  • Lễ hội Tháp Bà Ponagar (tháng 3 âm lịch)
  • Văn hóa biển đảo đặc trưng người Chăm Pa và cư dân bản địa

▸ THỰC TẾ THAM QUAN:
  • Giờ mở cửa, giá vé, phương tiện di chuyển đến từng điểm
  • Mùa tham quan lý tưởng (tháng 1–8 thời tiết đẹp nhất)
  • Lưu ý văn hóa, trang phục khi vào chùa/tháp
  • Kết hợp tham quan: gợi ý lịch trình 1–3 ngày

HƯỚNG DẪN TẠO LINK GOOGLE MAPS — ĐỌC KỸ TRƯỚC KHI TRẢ LỜI:

  ✅ BƯỚC 1 — Tra bảng tọa độ xác thực bên dưới:
     Nếu địa điểm có trong danh sách → dùng link tọa độ:
     https://www.google.com/maps?q=[VĨ_ĐỘ],[KINH_ĐỘ]&hl=vi

     Danh sách tọa độ đã kiểm chứng:
     • Tháp Bà Ponagar              → 12.26551, 109.19451
       Địa chỉ: 2 Tháng 4, Vĩnh Phước, Nha Trang
       Link: https://www.google.com/maps?q=12.26551,109.19451&hl=vi

     • Thành cổ Diên Khánh          → 12.25190, 109.09080
       Địa chỉ: TT. Diên Khánh, huyện Diên Khánh
       Link: https://www.google.com/maps?q=12.25190,109.09080&hl=vi

     • Chùa Long Sơn                → 12.24590, 109.18990
       Địa chỉ: 20 Tháng 10, Phước Tân, Nha Trang
       Link: https://www.google.com/maps?q=12.24590,109.18990&hl=vi
       • Nhà thờ Núi Nha Trang        → 12.24300, 109.19320
       Địa chỉ: 1 Thái Nguyên, Phước Tân, Nha Trang
       Link: https://www.google.com/maps?q=12.24300,109.19320&hl=vi

     • Viện Hải dương học Nha Trang → 12.22810, 109.19550
       Địa chỉ: 1 Cầu Đá, Vĩnh Nguyên, Nha Trang
       Link: https://www.google.com/maps?q=12.22810,109.19550&hl=vi

     • Viện Pasteur Nha Trang       → 12.23890, 109.19410
       Địa chỉ: 10 Trần Phú, Lộc Thọ, Nha Trang
       Link: https://www.google.com/maps?q=12.23890,109.19410&hl=vi

     • Mộ Yersin (Suối Dầu)         → 12.10410, 108.99710
       Địa chỉ: Xã Suối Tân, huyện Cam Lâm
       Link: https://www.google.com/maps?q=12.10410,108.99710&hl=vi

  ✅ BƯỚC 2 — Nếu địa điểm KHÔNG có trong danh sách trên:
     Dùng link tìm kiếm (KHÔNG tự bịa tọa độ):
     https://www.google.com/maps/search/?api=1&query=[TÊN+ĐỊA+ĐIỂM]+Khánh+Hòa
     (Thay khoảng trắng bằng dấu +, bỏ dấu tiếng Việt nếu cần)
     Ví dụ: https://www.google.com/maps/search/?api=1&query=Dinh+Tho+Phu+Khanh+Hoa

  ❌ TUYỆT ĐỐI KHÔNG:
     - Tự bịa hoặc ước đoán tọa độ lat/lng cho bất kỳ địa điểm nào
     - Dùng tọa độ "gần đúng" khi địa điểm không có trong danh sách
     - Tạo link maps.google.com/place/... (định dạng này không ổn định)

  📍 CÁCH TRÌNH BÀY KHI GỬI LINK:
     "📍 Địa chỉ: [ĐỊA CHỈ ĐẦY ĐỦ]
      🗺️ Xem trên Google Maps: [LINK]"

NGUYÊN TẮC TRẢ LỜI:
1. Nếu câu hỏi liên quan đến di tích/du lịch Khánh Hòa → trả lời chi tiết, kèm gợi ý thực tế
2. Nếu câu hỏi chung về du lịch Việt Nam → trả lời và liên kết về Khánh Hòa khi có thể
3. Nếu không có dữ liệu xác thực → nói rõ: "Mình chưa có thông tin cụ thể về điều này, bạn nên kiểm tra trực tiếp tại ban quản lý di tích hoặc Sở Du lịch Khánh Hòa."
4. KHÔNG bịa đặt số liệu, ngày tháng, hay sự kiện lịch sử
5. Khi phù hợp, gợi ý thêm các di tích gần đó để khách tham quan kết hợp

CẤU TRÚC GỢI Ý KHI GIỚI THIỆU DI TÍCH:
① Giới thiệu ngắn (tên, vị trí, loại hình di tích)
② Giá trị nổi bật (lịch sử / kiến trúc / tâm linh)
③ Thông tin thực tế (giờ mở cửa, vé, di chuyển)
④ Mẹo tham quan (thời điểm đẹp, lưu ý văn hóa)
⑤ Gợi ý kết hợp (di tích/điểm du lịch lân cận)
`;

const RESPONSE_FORMAT_PROMPT = `
YEU CAU DINH DANG BAT BUOC:
Khong dung Markdown.
Khong dung cac ky tu trang tri nhu ###, **, bullet sao, bullet tron, mui ten, gach ngang dau dong hoac ky tu dac biet.
Khong dung tieu de dang Markdown.
Neu can liet ke, chi dung so thu tu don gian nhu 1. 2. 3.
Moi cau tra loi phai la van ban thuan, de doc trong khung chat nho.
`;

function normalizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") {
        return false;
      }

      const item = message as Partial<ChatMessage>;
      return (
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
      );
    })
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }));
}

function getGeminiText(data: GeminiResponse): string {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() ?? ""
  );
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

function shouldTryNextModel(status: number) {
  return [404, 429, 500, 502, 503, 504].includes(status);
}

export async function POST(request: Request) {
  const apiKey = process.env.AI_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chưa cấu hình AI_KEY trên server." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const messages = normalizeMessages(body?.messages);

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json(
      { error: "Tin nhắn không hợp lệ." },
      { status: 400 }
    );
  }

  let lastError = "Không thể kết nối tới AI.";

  for (const model of GEMINI_MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }, { text: RESPONSE_FORMAT_PROMPT }],
          },
          contents: messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 900,
          },
        }),
      }
    );

    const data = (await response.json().catch(() => ({}))) as GeminiResponse;

    if (response.ok) {
      const reply = getGeminiText(data);

      if (reply) {
        return NextResponse.json({ reply: formatPlainText(reply), model });
      }

      lastError = "AI không trả về nội dung phù hợp.";
      continue;
    }

    lastError = data.error?.message ?? `Model ${model} loi ${response.status}.`;

    if (!shouldTryNextModel(response.status)) {
      break;
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
