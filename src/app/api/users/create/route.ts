import { requireAdmin } from "@/lib/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password, fullName, role } = await request.json();

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Mật khẩu tối thiểu 6 ký tự" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const profileRole = role === "ADMIN" ? "ADMIN" : "USER";
    await prisma.profile.upsert({
      where: { id: data.user.id },
      update: { role: profileRole, email, fullName },
      create: {
        id: data.user.id,
        email,
        fullName,
        role: profileRole,
      },
    });
    await prisma.$disconnect();
  }

  return NextResponse.json({ message: "Tạo tài khoản thành công", userId: data.user?.id }, { status: 201 });
}
