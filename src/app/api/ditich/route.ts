import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { diTichSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const khuVucAliases: Record<string, string[]> = {
  "Nha Trang": ["Nha Trang", "TP. Nha Trang", "Thành phố Nha Trang"],
  "Cam Ranh": ["Cam Ranh", "TP. Cam Ranh", "Thành phố Cam Ranh"],
  "Ninh Hòa": ["Ninh Hòa", "TX. Ninh Hòa", "Thị xã Ninh Hòa", "Ninh Hoà"],
  "Diên Khánh": ["Diên Khánh", "Diên Khanh"],
  "Cam Lâm": ["Cam Lâm", "Cam Lam"],
  "Khánh Vĩnh": ["Khánh Vĩnh", "Khanh Vinh"],
  "Khánh Sơn": ["Khánh Sơn", "Khanh Son"],
  "Vạn Ninh": ["Vạn Ninh", "Van Ninh"],
  "Trường Sa": ["Trường Sa", "Truong Sa"],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const danhMucId = searchParams.get("danhMucId");
  const capDiTich = searchParams.get("capDiTich");
  const donViQuanLy = searchParams.get("donViQuanLy");
  const trangThai = searchParams.get("trangThai");
  const khuVuc = searchParams.get("khuVuc");
  const pageIndex = Math.max(1, Number(searchParams.get("pageIndex")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const khuVucTerms = khuVuc && khuVuc !== "all" ? khuVucAliases[khuVuc] || [khuVuc] : [];
  const filters: Prisma.DiTichWhereInput[] = [];

  if (search) {
    filters.push({
      OR: [
        { tenDiTich: { contains: search, mode: "insensitive" as const } },
        { diaChi: { contains: search, mode: "insensitive" as const } },
        { donViQuanLy: { contains: search, mode: "insensitive" as const } },
        { donViQuanLyInfo: { is: { tenDonVi: { contains: search, mode: "insensitive" as const } } } },
        { moTa: { contains: search, mode: "insensitive" as const } },
      ],
    });
  }

  if (khuVucTerms.length > 0) {
    filters.push({
      OR: khuVucTerms.map((term) => ({ diaChi: { contains: term, mode: "insensitive" as const } })),
    });
  }

  const where: Prisma.DiTichWhereInput = {
    ...(trangThai === "all" ? {} : { trangThai: trangThai === "false" ? false : true }),
    ...(danhMucId && danhMucId !== "all" && { danhMucId: Number(danhMucId) }),
    ...(capDiTich && capDiTich !== "all" && { capDiTich: capDiTich as "CAP_TINH" | "CAP_QUOC_GIA" }),
    ...(donViQuanLy && donViQuanLy !== "all" && {
      OR: [
        { donViQuanLy: { contains: donViQuanLy, mode: "insensitive" as const } },
        { donViQuanLyInfo: { is: { tenDonVi: { contains: donViQuanLy, mode: "insensitive" as const } } } },
      ],
    }),
    ...(filters.length > 0 && { AND: filters }),
  };

  const orderBy: Prisma.DiTichOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  const [items, totalCount] = await Promise.all([
    prisma.diTich.findMany({
      where,
      include: {
        danhMuc: true,
        donViQuanLyInfo: true,
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
    include: { danhMuc: true, donViQuanLyInfo: true },
  });

  return NextResponse.json(diTich, { status: 201 });
}
