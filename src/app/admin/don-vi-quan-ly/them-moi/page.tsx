"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donViQuanLySchema, type DonViQuanLyInput } from "@/lib/validations";
import ImageUpload from "@/components/admin/ImageUpload";
import MiniMapWrapper from "@/components/map/MiniMapWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ThemDonViQuanLyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<DonViQuanLyInput>({
    resolver: zodResolver(donViQuanLySchema),
    defaultValues: {
      trangThai: true,
      toaDoLat: 12.2388,
      toaDoLng: 109.1967,
    },
  });

  const lat = useWatch({ control, name: "toaDoLat" });
  const lng = useWatch({ control, name: "toaDoLng" });
  const tenDonVi = useWatch({ control, name: "tenDonVi" });
  const hasMap = typeof lat === "number" && !Number.isNaN(lat) && typeof lng === "number" && !Number.isNaN(lng);

  async function onSubmit(data: DonViQuanLyInput) {
    setLoading(true);
    const res = await fetch("/api/don-vi-quan-ly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Thêm đơn vị quản lý thành công");
      router.push("/admin/don-vi-quan-ly");
    } else {
      const err = await res.json();
      toast.error(err.error?.message || "Lỗi khi thêm đơn vị quản lý");
    }
    setLoading(false);
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-[#0A1628] font-heading mb-6">Thêm đơn vị quản lý</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <Card className="glass-card rounded-2xl border-white/20">
            <CardHeader><CardTitle className="text-base font-heading">Hình đại diện</CardTitle></CardHeader>
            <CardContent>
              <ImageUpload onChange={(url) => setValue("hinhAnh", url)} bucket="images" />
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-white/20">
            <CardHeader><CardTitle className="text-base font-heading">Thông tin đơn vị</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên đơn vị *</Label>
                <Input {...register("tenDonVi")} placeholder="Nhập tên đơn vị" />
                {errors.tenDonVi && <p className="text-sm text-destructive">{errors.tenDonVi.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input {...register("diaChi")} placeholder="Nhập địa chỉ" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Điện thoại</Label>
                  <Input {...register("dienThoai")} placeholder="Nhập số điện thoại" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...register("email")} placeholder="Nhập email" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input {...register("website")} placeholder="https://..." />
                {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" {...register("trangThai")} className="h-4 w-4 rounded border-slate-300" />
                Hiển thị
              </label>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card rounded-2xl border-white/20">
          <CardHeader><CardTitle className="text-base font-heading">Vị trí</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[320px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {hasMap ? (
                <MiniMapWrapper lat={lat} lng={lng} name={tenDonVi || "Đơn vị quản lý"} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">Nhập tọa độ để xem bản đồ</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vĩ độ</Label>
                <Input
                  type="number"
                  step="any"
                  {...register("toaDoLat", { setValueAs: (value) => value === "" ? null : Number(value) })}
                />
                {errors.toaDoLat && <p className="text-sm text-destructive">{errors.toaDoLat.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Kinh độ</Label>
                <Input
                  type="number"
                  step="any"
                  {...register("toaDoLng", { setValueAs: (value) => value === "" ? null : Number(value) })}
                />
                {errors.toaDoLng && <p className="text-sm text-destructive">{errors.toaDoLng.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/don-vi-quan-ly")} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold font-heading border border-slate-200 hover:bg-slate-50 transition-all">
            Quay lại
          </button>
          <button type="submit" disabled={loading} className="inline-flex items-center bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all disabled:opacity-50">
            {loading ? "Đang lưu..." : "Hoàn thành"}
          </button>
        </div>
      </form>
    </div>
  );
}
