import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { role, trangThai } = body;

  const data: Record<string, unknown> = {};
  if (role !== undefined) data.role = role;
  if (trangThai !== undefined) data.trangThai = trangThai;

  const user = await prisma.profile.update({
    where: { id },
    data,
  });

  return NextResponse.json(user);
}
