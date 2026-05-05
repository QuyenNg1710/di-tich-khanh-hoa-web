import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { baiVietSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

function whereById(id: string) {
  return /^\d+$/.test(id) ? { id: Number(id) } : { slug: id };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const baiViet = await prisma.baiViet.findUnique({
    where: whereById(id),
    include: {
      tacGia: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  if (!baiViet) {
    return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
  }

  return NextResponse.json(baiViet);
}

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
  const parsed = baiVietSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const baiViet = await prisma.baiViet.update({
    where: { id: Number(id) },
    data: parsed.data,
  });

  return NextResponse.json(baiViet);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.baiViet.update({
    where: { id: Number(id) },
    data: { trangThai: false },
  });

  return NextResponse.json({ message: "Đã xoá bài viết" });
}
