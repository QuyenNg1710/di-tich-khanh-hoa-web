import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "tong-quan";

  switch (type) {
    case "tong-quan": {
      const [tongDiTich, tongBaiViet, tongNguoiDung, tongLuotXem] =
        await Promise.all([
          prisma.diTich.count({ where: { trangThai: true } }),
          prisma.baiViet.count({ where: { trangThai: true } }),
          prisma.profile.count({ where: { trangThai: true } }),
          prisma.diTich.aggregate({
            where: { trangThai: true },
            _sum: { luotXem: true },
          }),
        ]);

      return NextResponse.json({
        tongDiTich,
        tongBaiViet,
        tongNguoiDung,
        tongLuotXem: tongLuotXem._sum.luotXem || 0,
      });
    }

    case "top-di-tich": {
      const items = await prisma.diTich.findMany({
        where: { trangThai: true },
        orderBy: { luotXem: "desc" },
        take: 10,
        select: { id: true, tenDiTich: true, luotXem: true },
      });
      return NextResponse.json(items);
    }

    case "di-tich-theo-danh-muc": {
      const items = await prisma.danhMuc.findMany({
        where: { trangThai: true },
        select: {
          tenDanhMuc: true,
          _count: { select: { diTichs: true } },
        },
      });
      return NextResponse.json(
        items.map((i) => ({ name: i.tenDanhMuc, value: i._count.diTichs }))
      );
    }

    case "danh-gia-gan-day": {
      const items = await prisma.danhGia.findMany({
        where: { trangThai: true },
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          diTich: { select: { tenDiTich: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      return NextResponse.json(items);
    }

    default:
      return NextResponse.json({ error: "Loại thống kê không hợp lệ" }, { status: 400 });
  }
}
