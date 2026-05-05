import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { danhGiaSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const danhGia = await prisma.danhGia.findUnique({ where: { id: Number(id) } });

  if (!danhGia || danhGia.userId !== user.id) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = danhGiaSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.danhGia.update({
    where: { id: Number(id) },
    data: parsed.data,
    include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const danhGia = await prisma.danhGia.findUnique({ where: { id: Number(id) } });

  if (!danhGia) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  const isOwner = danhGia.userId === user.id;
  let isAdmin = false;
  try {
    await requireAdmin();
    isAdmin = true;
  } catch { /* not admin */ }

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  await prisma.danhGia.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Đã xoá đánh giá" });
}
