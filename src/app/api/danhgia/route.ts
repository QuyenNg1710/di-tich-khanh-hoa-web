import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const pageIndex = Math.max(1, Number(searchParams.get("pageIndex")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));

  const where: Prisma.DanhGiaWhereInput = {
    ...(status === "pending" && { trangThai: false }),
    ...(status === "approved" && { trangThai: true }),
  };

  const [items, totalCount] = await Promise.all([
    prisma.danhGia.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        diTich: { select: { id: true, slug: true, tenDiTich: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
    }),
    prisma.danhGia.count({ where }),
  ]);

  return NextResponse.json({
    items,
    totalCount,
    pageIndex,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  });
}
