import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { diTichSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

function whereById(id: string) {
  return /^\d+$/.test(id) ? { id: Number(id) } : { slug: id };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const diTich = await prisma.diTich.findUnique({
    where: whereById(id),
    include: {
      danhMuc: true,
      donViQuanLyInfo: true,
      hinhAnhs: { orderBy: { thuTu: "asc" } },
      videos: { orderBy: { thuTu: "asc" } },
      audios: { orderBy: { thuTu: "asc" } },
      danhGias: {
        where: { trangThai: true },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { danhGias: true, yeuThichs: true } },
    },
  });

  if (!diTich) {
    return NextResponse.json({ error: "Không tìm thấy di tích" }, { status: 404 });
  }

  await prisma.diTich.update({
    where: whereById(id),
    data: { luotXem: { increment: 1 } },
  });

  const avgRating = await prisma.danhGia.aggregate({
    where: { diTichId: diTich.id, trangThai: true },
    _avg: { diemSo: true },
  });

  return NextResponse.json({
    ...diTich,
    diemTrungBinh: avgRating._avg.diemSo || 0,
  });
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
  const parsed = diTichSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const diTich = await prisma.diTich.update({
    where: whereById(id),
    data: parsed.data,
    include: { danhMuc: true, donViQuanLyInfo: true },
  });

  return NextResponse.json(diTich);
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

  await prisma.diTich.delete({ where: whereById(id) });

  return NextResponse.json({ message: "Đã xoá di tích" });
}
