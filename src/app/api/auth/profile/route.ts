import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const fullName = String(body?.fullName || "").trim();
  const avatarUrl = String(body?.avatarUrl || "").trim();

  if (fullName.length < 2) {
    return NextResponse.json(
      { error: "Họ tên phải có ít nhất 2 ký tự." },
      { status: 400 }
    );
  }

  if (fullName.length > 120) {
    return NextResponse.json(
      { error: "Họ tên không được vượt quá 120 ký tự." },
      { status: 400 }
    );
  }

  if (avatarUrl) {
    try {
      const url = new URL(avatarUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Link ảnh đại diện không hợp lệ." },
        { status: 400 }
      );
    }
  }

  const updatedProfile = await prisma.profile.update({
    where: { id: user.id },
    data: {
      fullName,
      avatarUrl: avatarUrl || null,
    },
  });

  const supabase = await createClient();
  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl || null,
    },
  });

  return NextResponse.json(updatedProfile);
}
