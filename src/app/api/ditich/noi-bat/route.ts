import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(20, Number(searchParams.get("count")) || 4);

  const items = await prisma.diTich.findMany({
    where: { trangThai: true },
    orderBy: { luotXem: "desc" },
    take: count,
    include: {
      danhMuc: true,
      hinhAnhs: { orderBy: { thuTu: "asc" }, take: 1 },
    },
  });

  return NextResponse.json(items);
}
