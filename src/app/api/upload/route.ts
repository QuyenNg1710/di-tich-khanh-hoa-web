import { requireAdmin } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_BUCKETS = ["images", "videos", "audio"];
const MAX_SIZES: Record<string, number> = {
  images: 5 * 1024 * 1024,
  videos: 50 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
};

interface FlatStorageFile {
  path: string;
  name: string;
  url: string;
  metadata: { size?: number; mimetype?: string } | null;
}

function createStorageAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase storage environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string;
  const prefix = String(formData.get("prefix") || "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "");

  if (!file) {
    return NextResponse.json({ error: "Chưa chọn file" }, { status: 400 });
  }

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json(
      { error: "Bucket phải là images, videos hoặc audio" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZES[bucket]) {
    const maxMB = MAX_SIZES[bucket] / (1024 * 1024);
    return NextResponse.json(
      { error: `File vượt quá ${maxMB}MB` },
      { status: 400 }
    );
  }

  const supabase = createStorageAdminClient();
  const ext = file.name.split(".").pop();
  const baseFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const fileName = prefix ? `${prefix}/${baseFileName}` : baseFileName;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl, fileName }, { status: 201 });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket");

  if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json(
      { error: "Bucket phải là images, videos hoặc audio" },
      { status: 400 }
    );
  }

  const supabase = createStorageAdminClient();
  const files: FlatStorageFile[] = [];

  async function listRecursive(prefix: string) {
    const { data, error } = await supabase.storage.from(bucket as string).list(prefix, {
      limit: 500,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      throw new Error(error.message);
    }

    for (const item of data || []) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.id === null) {
        await listRecursive(fullPath);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket as string)
        .getPublicUrl(fullPath);

      files.push({
        path: fullPath,
        name: item.name,
        url: publicUrlData.publicUrl,
        metadata: item.metadata as FlatStorageFile["metadata"],
      });
    }
  }

  try {
    await listRecursive("");
    return NextResponse.json({ files });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không lấy được danh sách file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket");
  const fileName = searchParams.get("fileName");

  if (!bucket || !fileName) {
    return NextResponse.json({ error: "Thiếu bucket hoặc fileName" }, { status: 400 });
  }

  const supabase = createStorageAdminClient();
  const { error } = await supabase.storage.from(bucket).remove([fileName]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Đã xoá file" });
}
