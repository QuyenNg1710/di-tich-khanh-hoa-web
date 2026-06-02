import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Heart, Mail, ShieldCheck, Star, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}

export default async function TrangCaNhanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/dang-nhap");
  }

  const [favoriteCount, reviewCount, postCount] = await Promise.all([
    prisma.yeuThich.count({ where: { userId: user.id } }),
    prisma.danhGia.count({ where: { userId: user.id } }),
    prisma.baiViet.count({ where: { tacGiaId: user.id } }),
  ]);

  const roleLabel = user.role === "ADMIN" ? "Quản trị viên" : "Người dùng";
  const statusLabel = user.trangThai ? "Đang hoạt động" : "Tạm khóa";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-slate-950">
          Trang cá nhân
        </h1>
        <p className="text-sm text-slate-500">
          Thông tin tài khoản và hoạt động của bạn trên hệ thống.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="border-teal-100 shadow-ambient-teal">
          <CardContent className="flex flex-col items-center px-6 py-8 text-center">
            <Avatar className="mb-4 size-24 ring-4 ring-teal-100">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              ) : null}
              <AvatarFallback className="bg-teal-50 font-heading text-3xl font-bold text-teal-700">
                {getInitial(user.fullName)}
              </AvatarFallback>
            </Avatar>

            <h2 className="font-heading text-xl font-semibold text-slate-950">
              {user.fullName}
            </h2>
            <Badge className="mt-3 bg-teal-600 text-white">{roleLabel}</Badge>
            <p className="mt-3 text-sm text-slate-500">{statusLabel}</p>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <ProfileEditForm
            fullName={user.fullName}
            avatarUrl={user.avatarUrl}
          />

          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                  <UserRound className="size-4 text-teal-600" />
                  Họ và tên
                </div>
                <p className="font-medium text-slate-900">{user.fullName}</p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                  <Mail className="size-4 text-teal-600" />
                  Email
                </div>
                <p className="break-words font-medium text-slate-900">
                  {user.email || "Chưa cập nhật"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                  <ShieldCheck className="size-4 text-teal-600" />
                  Vai trò
                </div>
                <p className="font-medium text-slate-900">{roleLabel}</p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                  <CalendarDays className="size-4 text-teal-600" />
                  Ngày tạo
                </div>
                <p className="font-medium text-slate-900">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-teal-100">
              <CardContent className="px-4 py-5">
                <Heart className="mb-3 size-5 text-rose-500" />
                <p className="text-2xl font-bold text-slate-950">
                  {favoriteCount}
                </p>
                <p className="text-sm text-slate-500">Di tích yêu thích</p>
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardContent className="px-4 py-5">
                <Star className="mb-3 size-5 text-amber-500" />
                <p className="text-2xl font-bold text-slate-950">
                  {reviewCount}
                </p>
                <p className="text-sm text-slate-500">Đánh giá đã gửi</p>
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardContent className="px-4 py-5">
                <UserRound className="mb-3 size-5 text-teal-600" />
                <p className="text-2xl font-bold text-slate-950">
                  {postCount}
                </p>
                <p className="text-sm text-slate-500">Bài viết liên quan</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/yeu-thich" className={buttonVariants()}>
              Xem yêu thích
            </Link>
            {user.role === "ADMIN" ? (
              <Link
                href="/admin/dashboard"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Vào trang quản trị
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
