"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diTichSchema, type DiTichInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

interface DanhMuc { id: number; tenDanhMuc: string; }

export default function ThemDiTichPage() {
  const router = useRouter();
  const [danhMucs, setDanhMucs] = useState<DanhMuc[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState("");
  const [selectedCap, setSelectedCap] = useState("CAP_TINH");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DiTichInput>({
    resolver: zodResolver(diTichSchema),
    defaultValues: { capDiTich: "CAP_TINH", donViQuanLyId: null, toaDoLat: 12.2388, toaDoLng: 109.1967 },
  });

  useEffect(() => {
    fetch("/api/danhmuc")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDanhMucs(data);
      })
      .catch(() => toast.error("Không tải được danh mục"));
  }, []);

  function handleDanhMucChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedDanhMuc(e.target.value);
    setValue("danhMucId", Number(e.target.value));
  }

  function handleCapChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedCap(e.target.value);
    setValue("capDiTich", e.target.value as "CAP_TINH" | "CAP_QUOC_GIA");
  }

  async function onSubmit(data: DiTichInput) {
    setLoading(true);
    const res = await fetch("/api/ditich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, donViQuanLyId: null }),
    });

    if (res.ok) {
      toast.success("Thêm di tích thành công");
      router.push("/admin/di-tich");
    } else {
      const err = await res.json();
      toast.error(err.error?.message || "Lỗi khi thêm di tích");
    }
    setLoading(false);
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-[#0A1628] font-heading mb-6">Thêm di tích mới</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="glass-card rounded-2xl border-white/20">
          <CardHeader><CardTitle className="text-base font-heading">Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên di tích *</Label>
              <Input {...register("tenDiTich")} placeholder="Nhập tên di tích" />
              {errors.tenDiTich && <p className="text-sm text-destructive">{errors.tenDiTich.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <select
                  value={selectedDanhMuc}
                  onChange={handleDanhMucChange}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Chọn danh mục</option>
                  {danhMucs.map((dm) => (
                    <option key={dm.id} value={dm.id}>{dm.tenDanhMuc}</option>
                  ))}
                </select>
                {errors.danhMucId && <p className="text-sm text-destructive">{errors.danhMucId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Cấp di tích *</Label>
                <select
                  value={selectedCap}
                  onChange={handleCapChange}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="CAP_TINH">Cấp tỉnh</option>
                  <option value="CAP_QUOC_GIA">Cấp quốc gia</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ *</Label>
              <Input {...register("diaChi")} placeholder="Nhập địa chỉ" />
              {errors.diaChi && <p className="text-sm text-destructive">{errors.diaChi.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Đơn vị quản lý</Label>
              <Input {...register("donViQuanLy")} placeholder="Nhập đơn vị quản lý" />
              {errors.donViQuanLy && <p className="text-sm text-destructive">{errors.donViQuanLy.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vĩ độ (Lat)</Label>
                <Input type="number" step="any" {...register("toaDoLat", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Kinh độ (Lng)</Label>
                <Input type="number" step="any" {...register("toaDoLng", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả ngắn *</Label>
              <Textarea {...register("moTa")} rows={3} placeholder="Mô tả ngắn gọn về di tích" />
              {errors.moTa && <p className="text-sm text-destructive">{errors.moTa.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Mô tả chi tiết</Label>
              <Textarea {...register("moTaChiTiet")} rows={6} placeholder="Mô tả chi tiết" />
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh đại diện</Label>
              <ImageUpload
                onChange={(url) => setValue("hinhAnhDaiDien", url)}
                bucket="images"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/di-tich")} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold font-heading border border-slate-200 hover:bg-slate-50 transition-all">
            Huỷ
          </button>
          <button type="submit" disabled={loading} className="inline-flex items-center bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all disabled:opacity-50">
            {loading ? "Đang lưu..." : "Lưu di tích"}
          </button>
        </div>
      </form>
    </div>
  );
}
