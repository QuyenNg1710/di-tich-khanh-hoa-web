import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const buckets = [
  {
    id: "images",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  },
  {
    id: "videos",
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ["video/mp4", "video/webm", "video/ogg"],
  },
  {
    id: "audio",
    public: true,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"],
  },
];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  for (const bucket of buckets) {
    const { data: existingBucket, error: getError } = await supabase.storage.getBucket(bucket.id);

    if (existingBucket) {
      const { error: updateError } = await supabase.storage.updateBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });

      if (updateError) {
        throw new Error(`Failed to update bucket "${bucket.id}": ${updateError.message}`);
      }

      console.log(`Updated bucket: ${bucket.id}`);
      continue;
    }

    if (getError && getError.message !== "Bucket not found") {
      throw new Error(`Failed to check bucket "${bucket.id}": ${getError.message}`);
    }

    const { error: createError } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    });

    if (createError) {
      throw new Error(`Failed to create bucket "${bucket.id}": ${createError.message}`);
    }

    console.log(`Created bucket: ${bucket.id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
