import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { donViQuanLySchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.donViQuanLy.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { diTichs: true } } },
  });

  if (!item) {
    return NextResponse.json({ error: "Không tìm thấy đơn vị quản lý" }, { status: 404 });
  }

  return NextResponse.json(item);
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
  const parsed = donViQuanLySchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.donViQuanLy.update({
    where: { id: Number(id) },
    data: parsed.data,
  });

  return NextResponse.json(item);
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
  await prisma.donViQuanLy.update({
    where: { id: Number(id) },
    data: { trangThai: false },
  });

  return NextResponse.json({ message: "Đã xoá đơn vị quản lý" });
}
