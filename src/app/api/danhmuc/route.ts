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
    return NextResponse.json({ message: "Bạn cần đăng nhập bằng tài khoản quản trị để thêm danh mục." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = danhMucSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const message = Object.values(fieldErrors).flat()[0] || "Dữ liệu danh mục không hợp lệ.";
    return NextResponse.json({ message, error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const danhMuc = await prisma.danhMuc.create({ data: parsed.data });
    return NextResponse.json(danhMuc, { status: 201 });
  } catch (error) {
    console.error("Create danh muc error:", error);
    return NextResponse.json({ message: "Không thêm được danh mục. Vui lòng kiểm tra lại dữ liệu." }, { status: 500 });
  }
}
