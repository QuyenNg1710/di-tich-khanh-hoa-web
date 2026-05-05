import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { danhGiaSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Number(searchParams.get("limit")) || 10);

  const [items, totalCount] = await Promise.all([
    prisma.danhGia.findMany({
      where: { diTichId: Number(id), trangThai: true },
      include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.danhGia.count({ where: { diTichId: Number(id), trangThai: true } }),
  ]);

  const avg = await prisma.danhGia.aggregate({
    where: { diTichId: Number(id), trangThai: true },
    _avg: { diemSo: true },
  });

  return NextResponse.json({
    items,
    totalCount,
    diemTrungBinh: avg._avg.diemSo || 0,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = danhGiaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.danhGia.findUnique({
    where: { userId_diTichId: { userId: user.id, diTichId: Number(id) } },
  });

  if (existing) {
    return NextResponse.json({ error: "Bạn đã đánh giá di tích này rồi" }, { status: 409 });
  }

  const danhGia = await prisma.danhGia.create({
    data: {
      userId: user.id,
      diTichId: Number(id),
      ...parsed.data,
    },
    include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
  });

  return NextResponse.json(danhGia, { status: 201 });
}
