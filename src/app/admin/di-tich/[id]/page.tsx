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
interface FetchedDiTich {
  tenDiTich: string;
  moTa: string;
  moTaChiTiet: string | null;
  diaChi: string;
  donViQuanLy: string | null;
  donViQuanLyId: number | null;
  donViQuanLyInfo?: { tenDonVi: string } | null;
  toaDoLat: number;
  toaDoLng: number;
  danhMucId: number;
  capDiTich: "CAP_TINH" | "CAP_QUOC_GIA";
  hinhAnhDaiDien: string | null;
  hinhAnhs?: MediaItem[];
  videos?: MediaItem[];
  audios?: MediaItem[];
}

function getReturnUrl() {
  if (typeof window === "undefined") return "/admin/di-tich";

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get("returnUrl");
  if (returnUrl?.startsWith("/admin/di-tich")) {
    return returnUrl;
  }

  const returnPage = Number(params.get("returnPage")) || 1;
  const returnSearch = params.get("returnSearch") || "";
  const listParams = new URLSearchParams();

  if (returnPage > 1) listParams.set("page", String(returnPage));
  if (returnSearch) listParams.set("search", returnSearch);

  const query = listParams.toString();
  if (query) return `/admin/di-tich?${query}`;

  const storedUrl = window.sessionStorage.getItem("adminDiTichReturnUrl");
  if (storedUrl?.startsWith("/admin/di-tich")) {
    return storedUrl;
  }

  return "/admin/di-tich";
}

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

  const applyDiTichData = useCallback((dt: FetchedDiTich) => {
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
      donViQuanLy: dt.donViQuanLy || dt.donViQuanLyInfo?.tenDonVi || "",
      donViQuanLyId: null,
      toaDoLat: dt.toaDoLat,
      toaDoLng: dt.toaDoLng,
      danhMucId: dt.danhMucId,
      capDiTich: dt.capDiTich,
      hinhAnhDaiDien: dt.hinhAnhDaiDien || "",
    });
  }, [reset]);

  const fetchDiTich = useCallback(async () => {
    const res = await fetch(`/api/ditich/${id}`);
    const dt = await res.json();
    applyDiTichData(dt);
  }, [applyDiTichData, id]);

  useEffect(() => {
    Promise.all([
      fetch("/api/danhmuc").then((r) => r.json()),
      fetch(`/api/ditich/${id}`).then((r) => r.json()),
    ]).then(([dms, dt]) => {
      if (Array.isArray(dms)) setDanhMucs(dms);
      applyDiTichData(dt);
      setFetching(false);
    });
  }, [applyDiTichData, id]);

  function handleRefreshMedia() {
    fetchDiTich();
  }

  async function onSubmit(data: DiTichInput) {
    setLoading(true);
    const returnUrl = getReturnUrl();
    const res = await fetch(`/api/ditich/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, donViQuanLyId: null }),
    });

    if (res.ok) {
      toast.success("Cập nhật thành công");
      window.location.href = returnUrl;
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

            <div className="space-y-2">
              <Label>Đơn vị quản lý</Label>
              <Input {...register("donViQuanLy")} placeholder="Nhập đơn vị quản lý" />
              {errors.donViQuanLy && <p className="text-sm text-destructive">{errors.donViQuanLy.message}</p>}
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
          <button type="button" onClick={() => router.push(getReturnUrl())} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold font-heading border border-slate-200 hover:bg-slate-50 transition-all">
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
