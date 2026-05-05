import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { danhMucSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.danhMuc.findMany({
    where: { trangThai: true },
    orderBy: { thuTu: "asc" },
    include: { _count: { select: { diTichs: true } } },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = danhMucSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const danhMuc = await prisma.danhMuc.create({ data: parsed.data });
  return NextResponse.json(danhMuc, { status: 201 });
}
