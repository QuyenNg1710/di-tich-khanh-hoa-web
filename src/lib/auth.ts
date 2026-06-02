import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const fullName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user.email || "User";
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : undefined;

  const existingProfile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (existingProfile) {
    return prisma.profile.update({
      where: { id: user.id },
      data: {
        email: user.email,
      },
    });
  }

  const profile = await prisma.profile.create({
    data: {
      id: user.id,
      email: user.email,
      fullName,
      avatarUrl,
    },
  });
  return profile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || String(user.role) !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}
