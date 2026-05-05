import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { diTichSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const danhMucId = searchParams.get("danhMucId");
  const capDiTich = searchParams.get("capDiTich");
  const pageIndex = Math.max(1, Number(searchParams.get("pageIndex")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: Prisma.DiTichWhereInput = {
    trangThai: true,
    ...(search && {
      OR: [
        { tenDiTich: { contains: search, mode: "insensitive" as const } },
        { diaChi: { contains: search, mode: "insensitive" as const } },
        { moTa: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(danhMucId && { danhMucId: Number(danhMucId) }),
    ...(capDiTich && { capDiTich: capDiTich as "CAP_TINH" | "CAP_QUOC_GIA" }),
  };

  const orderBy: Prisma.DiTichOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  const [items, totalCount] = await Promise.all([
    prisma.diTich.findMany({
      where,
      include: {
        danhMuc: true,
        hinhAnhs: { orderBy: { thuTu: "asc" }, take: 1 },
        _count: { select: { danhGias: true } },
      },
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.diTich.count({ where }),
  ]);

  return NextResponse.json({
    items,
    totalCount,
    pageIndex,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = diTichSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let slug = generateSlug(parsed.data.tenDiTich);
  const existing = await prisma.diTich.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const diTich = await prisma.diTich.create({
    data: { ...parsed.data, slug },
    include: { danhMuc: true },
  });

  return NextResponse.json(diTich, { status: 201 });
}
