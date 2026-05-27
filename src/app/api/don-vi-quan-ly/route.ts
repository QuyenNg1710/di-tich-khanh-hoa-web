import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { donViQuanLySchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const includeHidden = searchParams.get("includeHidden") === "true";

  const items = await prisma.donViQuanLy.findMany({
    where: {
      ...(!includeHidden && { trangThai: true }),
      ...(search && {
        OR: [
          { tenDonVi: { contains: search, mode: "insensitive" as const } },
          { diaChi: { contains: search, mode: "insensitive" as const } },
          { dienThoai: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    },
    include: { _count: { select: { diTichs: true } } },
    orderBy: { tenDonVi: "asc" },
  });

  const itemsWithCount = await Promise.all(
    items.map(async (item) => {
      const diTichCount = await prisma.diTich.count({
        where: {
          OR: [
            { donViQuanLyId: item.id },
            { donViQuanLy: { equals: item.tenDonVi, mode: "insensitive" as const } },
          ],
        },
      });

      return { ...item, _count: { ...item._count, diTichs: diTichCount } };
    })
  );

  return NextResponse.json(itemsWithCount);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = donViQuanLySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.donViQuanLy.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}
