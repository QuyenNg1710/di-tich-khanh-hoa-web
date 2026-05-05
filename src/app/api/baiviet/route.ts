import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { baiVietSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageIndex = Math.max(1, Number(searchParams.get("pageIndex")) || 1);
  const pageSize = Math.min(50, Number(searchParams.get("pageSize")) || 10);

  const where = { trangThai: true };

  const [items, totalCount] = await Promise.all([
    prisma.baiViet.findMany({
      where,
      include: {
        tacGia: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
    }),
    prisma.baiViet.count({ where }),
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
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = baiVietSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let slug = generateSlug(parsed.data.tieuDe);
  const existing = await prisma.baiViet.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const baiViet = await prisma.baiViet.create({
    data: { ...parsed.data, slug, tacGiaId: user.id },
  });

  return NextResponse.json(baiViet, { status: 201 });
}
