import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface ImgBbResponse {
  data?: {
    url?: string;
    display_url?: string;
    delete_url?: string;
  };
  error?: {
    message?: string;
  };
  success?: boolean;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await requireAuth().catch(() => null);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.IMGBB_API_KEY || "a1f4e6aeff5104c8d75e8edbba11d7c3";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chưa cấu hình IMGBB_API_KEY trên server." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Chưa chọn file ảnh." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Chỉ chấp nhận file hình ảnh." },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "Ảnh không được vượt quá 5MB." },
      { status: 400 }
    );
  }

  const uploadFormData = new FormData();
  uploadFormData.append("image", file);
  uploadFormData.append("name", `avatar-${user.id}-${Date.now()}`);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: uploadFormData,
    }
  );

  const data = (await response.json().catch(() => ({}))) as ImgBbResponse;

  if (!response.ok || !data.success) {
    return NextResponse.json(
      { error: data.error?.message || "Không upload được ảnh lên ImgBB." },
      { status: 400 }
    );
  }

  const url = data.data?.display_url || data.data?.url;

  if (!url) {
    return NextResponse.json(
      { error: "ImgBB không trả về link ảnh." },
      { status: 400 }
    );
  }

  return NextResponse.json({ url, deleteUrl: data.data?.delete_url });
}
