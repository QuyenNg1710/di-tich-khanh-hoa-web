import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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
  const { type, url, moTa, thuTu } = body;

  const diTichId = Number(id);

  let result;
  switch (type) {
    case "image":
      result = await prisma.hinhAnh.create({
        data: { diTichId, url, moTa, thuTu: thuTu || 0 },
      });
      await prisma.diTich.updateMany({
        where: {
          id: diTichId,
          OR: [{ hinhAnhDaiDien: null }, { hinhAnhDaiDien: "" }],
        },
        data: { hinhAnhDaiDien: url },
      });
      break;
    case "video":
      result = await prisma.video.create({
        data: { diTichId, url, moTa, thuTu: thuTu || 0 },
      });
      break;
    case "audio":
      if (typeof url === "string" && url.startsWith("tts://")) {
        await prisma.audio.deleteMany({
          where: {
            diTichId,
            url: { startsWith: "tts://" },
          },
        });
      }

      result = await prisma.audio.create({
        data: { diTichId, url, moTa, thuTu: thuTu || 0 },
      });
      break;
    default:
      return NextResponse.json({ error: "type phải là image, video hoặc audio" }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const mediaId = Number(searchParams.get("mediaId"));

  switch (type) {
    case "image":
      await prisma.hinhAnh.delete({ where: { id: mediaId } });
      break;
    case "video":
      await prisma.video.delete({ where: { id: mediaId } });
      break;
    case "audio":
      await prisma.audio.delete({ where: { id: mediaId } });
      break;
    default:
      return NextResponse.json({ error: "type phải là image, video hoặc audio" }, { status: 400 });
  }

  return NextResponse.json({ message: "Đã xoá" });
}
