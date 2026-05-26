"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import MediaManager from "@/components/admin/MediaManager";

interface DanhMuc { id: number; tenDanhMuc: string; }
interface MediaItem { id: number; url: string; moTa: string | null; thuTu: number; }

export default function EditDiTichPage() {
  const { id } = useParams();
  const router = useRouter();
  const [danhMucs, setDanhMucs] = useState<DanhMuc[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState("");
  const [selectedCap, setSelectedCap] = useState("CAP_TINH");
  const [hinhAnhs, setHinhAnhs] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [audios, setAudios] = useState<MediaItem[]>([]);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<DiTichInput>({
    resolver: zodResolver(diTichSchema),
  });

  const fetchDiTich = useCallback(async () => {
    const res = await fetch(`/api/ditich/${id}`);
    const dt = await res.json();
    setSelectedDanhMuc(String(dt.danhMucId));
    setSelectedCap(dt.capDiTich);
    setHinhAnhs(dt.hinhAnhs || []);
    setVideos(dt.videos || []);
    setAudios(dt.audios || []);
    reset({
      tenDiTich: dt.tenDiTich,
      moTa: dt.moTa,
      moTaChiTiet: dt.moTaChiTiet || "",
      diaChi: dt.diaChi,
      toaDoLat: dt.toaDoLat,
      toaDoLng: dt.toaDoLng,
      danhMucId: dt.danhMucId,
      capDiTich: dt.capDiTich,
      hinhAnhDaiDien: dt.hinhAnhDaiDien || "",
    });
  }, [id, reset]);

  useEffect(() => {
    Promise.all([
      fetch("/api/danhmuc").then((r) => r.json()),
      fetchDiTich(),
    ]).then(([dms]) => {
      if (Array.isArray(dms)) setDanhMucs(dms);
      setFetching(false);
    });
  }, [fetchDiTich]);

  function handleRefreshMedia() {
    fetchDiTich();
  }

  async function onSubmit(data: DiTichInput) {
    setLoading(true);
    const res = await fetch(`/api/ditich/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Cập nhật thành công");
      router.push("/admin/di-tich");
    } else {
      toast.error("Lỗi khi cập nhật");
    }
    setLoading(false);
  }

  if (fetching) return <div className="text-center py-16 text-slate-500">Đang tải...</div>;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-[#0A1628] font-heading mb-6">Chỉnh sửa di tích</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="glass-card rounded-2xl border-white/20">
          <CardHeader><CardTitle className="text-base font-heading">Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên di tích *</Label>
              <Input {...register("tenDiTich")} />
              {errors.tenDiTich && <p className="text-sm text-destructive">{errors.tenDiTich.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <select value={selectedDanhMuc} onChange={(e) => { setSelectedDanhMuc(e.target.value); setValue("danhMucId", Number(e.target.value)); }} className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Chọn danh mục</option>
                  {danhMucs.map((dm) => (<option key={dm.id} value={dm.id}>{dm.tenDanhMuc}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Cấp di tích *</Label>
                <select value={selectedCap} onChange={(e) => { setSelectedCap(e.target.value); setValue("capDiTich", e.target.value as "CAP_TINH" | "CAP_QUOC_GIA"); }} className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="CAP_TINH">Cấp tỉnh</option>
                  <option value="CAP_QUOC_GIA">Cấp quốc gia</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ *</Label>
              <Input {...register("diaChi")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vĩ độ</Label>
                <Input type="number" step="any" {...register("toaDoLat", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Kinh độ</Label>
                <Input type="number" step="any" {...register("toaDoLng", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả *</Label>
              <Textarea {...register("moTa")} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Mô tả chi tiết</Label>
              <Textarea {...register("moTaChiTiet")} rows={6} />
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh đại diện</Label>
              <ImageUpload value={watch("hinhAnhDaiDien") || ""} onChange={(url) => setValue("hinhAnhDaiDien", url)} bucket="images" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/di-tich")} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold font-heading border border-slate-200 hover:bg-slate-50 transition-all">
            Huỷ
          </button>
          <button type="submit" disabled={loading} className="inline-flex items-center bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all disabled:opacity-50">
            {loading ? "Đang lưu..." : "Cập nhật"}
          </button>
        </div>
      </form>

      {/* Media Manager - ngoài form vì upload riêng */}
      <Card className="glass-card rounded-2xl border-white/20 mt-6">
        <CardHeader><CardTitle className="text-base font-heading">Quản lý Media</CardTitle></CardHeader>
        <CardContent>
          <MediaManager
            diTichId={Number(id)}
            hinhAnhs={hinhAnhs}
            videos={videos}
            audios={audios}
            onRefresh={handleRefreshMedia}
          />
        </CardContent>
      </Card>
    </div>
  );
}
