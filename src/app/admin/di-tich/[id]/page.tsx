"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import MediaManager from "@/components/admin/MediaManager";
import { LuUpload } from "react-icons/lu";

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
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

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

  async function handleCoverUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file hình ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "images");
    formData.append("prefix", String(id));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.url) {
      setValue("hinhAnhDaiDien", data.url);
      toast.success("Đã tải ảnh lên ImgBB");
    } else {
      toast.error(data.error || "Không thể upload ảnh");
    }

    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
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

      <form id="edit-di-tich-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="glass-card rounded-2xl border-white/20">
          <CardHeader><CardTitle className="text-base font-heading">Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
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

            <div className="space-y-2 lg:col-span-2">
              <Label>Mô tả *</Label>
              <Textarea {...register("moTa")} rows={3} />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Mô tả chi tiết</Label>
              <Textarea {...register("moTaChiTiet")} rows={6} />
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 lg:col-span-2">
              <Label>Hình ảnh đại diện</Label>
              {watch("hinhAnhDaiDien") ? (
                <img
                  src={watch("hinhAnhDaiDien") || ""}
                  alt="Ảnh đại diện"
                  className="h-56 w-full rounded-lg border border-slate-200 object-cover"
                />
              ) : null}
              <Input
                value={watch("hinhAnhDaiDien") || ""}
                onChange={(e) => setValue("hinhAnhDaiDien", e.target.value)}
                placeholder="Nhập link ảnh đại diện..."
                className="h-10"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
              >
                <LuUpload className="h-4 w-4" />
                {uploadingCover ? "Đang tải..." : "Tải ảnh lên ImgBB và chuyển thành link"}
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                }}
              />
            </div>
          </CardContent>
        </Card>

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
            description={watch("moTa") || ""}
            onRefresh={handleRefreshMedia}
          />
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => router.push(getReturnUrl())} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold font-heading border border-slate-200 hover:bg-slate-50 transition-all">
          Huỷ
        </button>
        <button type="submit" form="edit-di-tich-form" disabled={loading} className="inline-flex items-center bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all disabled:opacity-50">
          {loading ? "Đang lưu..." : "Cập nhật"}
        </button>
      </div>
    </div>
  );
}
