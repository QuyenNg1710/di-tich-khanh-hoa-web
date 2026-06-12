import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { danhMucSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Bạn cần đăng nhập bằng tài khoản quản trị để sửa danh mục." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = danhMucSchema.partial().safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const message = Object.values(fieldErrors).flat()[0] || "Dữ liệu danh mục không hợp lệ.";
    return NextResponse.json({ message, error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const danhMuc = await prisma.danhMuc.update({
      where: { id: Number(id) },
      data: parsed.data,
    });

    return NextResponse.json(danhMuc);
  } catch (error) {
    console.error("Update danh muc error:", error);
    return NextResponse.json({ message: "Không cập nhật được danh mục. Vui lòng kiểm tra lại dữ liệu." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Bạn cần đăng nhập bằng tài khoản quản trị để xoá danh mục." }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.danhMuc.update({
      where: { id: Number(id) },
      data: { trangThai: false },
    });
  } catch (error) {
    console.error("Delete danh muc error:", error);
    return NextResponse.json({ message: "Không xoá được danh mục." }, { status: 500 });
  }

  return NextResponse.json({ message: "Đã xoá danh mục" });
}
