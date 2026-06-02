import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { role, trangThai, fullName, avatarUrl } = body;

  const data: Record<string, unknown> = {};
  if (role !== undefined) data.role = role;
  if (trangThai !== undefined) data.trangThai = trangThai;
  if (fullName !== undefined) {
    const normalizedFullName = String(fullName).trim();

    if (normalizedFullName.length < 2) {
      return NextResponse.json(
        { error: "Họ tên phải có ít nhất 2 ký tự." },
        { status: 400 }
      );
    }

    data.fullName = normalizedFullName;
  }

  if (avatarUrl !== undefined) {
    const normalizedAvatarUrl = String(avatarUrl).trim();

    if (normalizedAvatarUrl) {
      try {
        const url = new URL(normalizedAvatarUrl);
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

    data.avatarUrl = normalizedAvatarUrl || null;
  }

  const user = await prisma.profile.update({
    where: { id },
    data,
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let currentUser;
  try {
    currentUser = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === currentUser.id) {
    return NextResponse.json({ error: "Không thể xoá tài khoản đang đăng nhập" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error && !error.message.toLowerCase().includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  try {
    await prisma.$transaction([
      prisma.yeuThich.deleteMany({ where: { userId: id } }),
      prisma.danhGia.deleteMany({ where: { userId: id } }),
      prisma.profile.delete({ where: { id } }),
    ]);
  } catch {
    return NextResponse.json(
      { error: "Không thể xoá hồ sơ tài khoản. Tài khoản có thể đang liên kết với dữ liệu khác." },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "Đã xoá tài khoản" });
}
