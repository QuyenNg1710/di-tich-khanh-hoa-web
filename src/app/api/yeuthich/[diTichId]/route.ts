import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ diTichId: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { diTichId } = await params;

  const existing = await prisma.yeuThich.findUnique({
    where: {
      userId_diTichId: { userId: user.id, diTichId: Number(diTichId) },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Đã yêu thích rồi" }, { status: 409 });
  }

  const yeuThich = await prisma.yeuThich.create({
    data: { userId: user.id, diTichId: Number(diTichId) },
  });

  return NextResponse.json(yeuThich, { status: 201 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ diTichId: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { diTichId } = await params;

  await prisma.yeuThich.deleteMany({
    where: { userId: user.id, diTichId: Number(diTichId) },
  });

  return NextResponse.json({ message: "Đã bỏ yêu thích" });
}
