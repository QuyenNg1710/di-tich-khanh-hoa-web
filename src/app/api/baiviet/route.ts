import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { baiVietSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageIndex = Math.max(1, Number(searchParams.get("pageIndex")) || 1);
  const pageSize = Math.min(50, Number(searchParams.get("pageSize")) || 10);

  const where = { trangThai: true };

  const [items, totalCount, diTichImages] = await Promise.all([
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
    prisma.diTich.findMany({
      where: { trangThai: true },
      select: {
        tenDiTich: true,
        hinhAnhDaiDien: true,
        hinhAnhs: { select: { url: true }, orderBy: { thuTu: "asc" }, take: 1 },
      },
      take: 200,
    }),
  ]);

  const itemsWithFallbackImages = items.map((item) => {
    if (item.hinhAnh) return item;

    const title = normalizeText(item.tieuDe);
    const relatedImage = diTichImages.find((diTich) => {
      const name = normalizeText(diTich.tenDiTich.trim());
      const importantWords = name.split(/\s+/).filter((word) => word.length > 2);
      return name && (title.includes(name) || importantWords.slice(0, 3).every((word) => title.includes(word)));
    });

    return {
      ...item,
      hinhAnh: relatedImage?.hinhAnhs[0]?.url || relatedImage?.hinhAnhDaiDien || null,
    };
  });

  return NextResponse.json({
    items: itemsWithFallbackImages,
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
