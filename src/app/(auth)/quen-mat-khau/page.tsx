"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function QuenMatKhauPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/dat-lai-mat-khau`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
    toast.success("Đã gửi email đặt lại mật khẩu");
  }

  return (
    <Card className="w-full max-w-md glass-card rounded-2xl border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-heading">Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email tài khoản để nhận liên kết đặt lại mật khẩu
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {sent && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt
              lại mật khẩu. Hãy kiểm tra cả hộp thư spam.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008378] hover:bg-[#00685f] text-white py-3 rounded-xl text-sm font-semibold font-heading active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
          </button>
          <Link
            href="/dang-nhap"
            className="text-sm font-medium text-teal-600 hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
