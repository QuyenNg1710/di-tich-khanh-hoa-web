import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { danhMucSchema } from "@/lib/validations";
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
  const parsed = danhMucSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const danhMuc = await prisma.danhMuc.update({
    where: { id: Number(id) },
    data: parsed.data,
  });

  return NextResponse.json(danhMuc);
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
  await prisma.danhMuc.update({
    where: { id: Number(id) },
    data: { trangThai: false },
  });

  return NextResponse.json({ message: "Đã xoá danh mục" });
}
