import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const capDiTich = searchParams.get("capDiTich");
  const danhMucId = searchParams.get("danhMucId");

  const items = await prisma.diTich.findMany({
    where: {
      trangThai: true,
      ...(capDiTich && { capDiTich: capDiTich as "CAP_TINH" | "CAP_QUOC_GIA" }),
      ...(danhMucId && { danhMucId: Number(danhMucId) }),
    },
    select: {
      id: true,
      slug: true,
      tenDiTich: true,
      diaChi: true,
      toaDoLat: true,
      toaDoLng: true,
      capDiTich: true,
      hinhAnhDaiDien: true,
      hinhAnhs: { select: { url: true }, orderBy: { thuTu: "asc" }, take: 1 },
      danhMuc: { select: { tenDanhMuc: true } },
    },
  });

  return NextResponse.json(
    items.map((item) => ({
      ...item,
      hinhAnhDaiDien: item.hinhAnhs[0]?.url || item.hinhAnhDaiDien,
      hinhAnhs: undefined,
      tenDanhMuc: item.danhMuc.tenDanhMuc,
      danhMuc: undefined,
    }))
  );
}
