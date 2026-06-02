"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { baiVietSchema, type BaiVietInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { HiTrash, HiPlus, HiPencil, HiSearch } from "react-icons/hi";
import ImageUpload from "@/components/admin/ImageUpload";

interface BaiViet {
  id: number;
  tieuDe: string;
  trangThai: boolean;
  createdAt: string;
  tacGia: { fullName: string };
}

const PAGE_SIZE = 10;

export default function AdminTinTucPage() {
  const [items, setItems] = useState<BaiViet[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BaiVietInput>({
    resolver: zodResolver(baiVietSchema),
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/baiviet?pageSize=50");
    const data = await res.json();
    setItems(data.items || []);
    setTotalCount(data.totalCount || 0);
    setPage(1);
    setLoading(false);
  }

  function openCreate() {
    reset({ tieuDe: "", noiDung: "", hinhAnh: "" });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(bv: BaiViet) {
    fetch(`/api/baiviet/${bv.id}`).then((r) => r.json()).then((data) => {
      reset({ tieuDe: data.tieuDe, noiDung: data.noiDung, hinhAnh: data.hinhAnh || "" });
      setEditId(bv.id);
      setShowForm(true);
    });
  }

  async function onSubmit(data: BaiVietInput) {
    setSubmitting(true);
    const url = editId ? `/api/baiviet/${editId}` : "/api/baiviet";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(editId ? "Cập nhật thành công" : "Thêm bài viết thành công");
      setShowForm(false);
      setEditId(null);
      reset({ tieuDe: "", noiDung: "", hinhAnh: "" });
      fetchData();
    } else {
      toast.error("Có lỗi xảy ra");
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/baiviet/${deleteId}`, { method: "DELETE" });
    toast.success("Đã xoá bài viết");
    setDeleteId(null);
    fetchData();
  }

  const filtered = search
    ? items.filter((bv) => bv.tieuDe.toLowerCase().includes(search.toLowerCase()))
    : items;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header — giống di tích */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] font-heading">Quản lý Bài viết</h1>
          <p className="text-sm text-slate-500 mt-1">{totalCount} bài viết trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all active:scale-95"
        >
          <HiPlus className="h-4 w-4" /> Thêm mới
        </button>
      </div>

      {/* Search — giống di tích */}
      <div className="relative max-w-sm">
        <HiSearch className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Tìm theo tiêu đề..."
          className="pl-9 bg-[#e0e3e5] border-0 rounded-2xl focus:ring-[#00685f]/20"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <Card className="glass-card rounded-2xl border-white/20">
          <CardHeader>
            <CardTitle className="text-base font-heading">
              {editId ? "Sửa bài viết" : "Thêm bài viết mới"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề *</Label>
                <Input {...register("tieuDe")} placeholder="Nhập tiêu đề bài viết" />
                {errors.tieuDe && <p className="text-sm text-destructive">{errors.tieuDe.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Nội dung *</Label>
                <Textarea {...register("noiDung")} rows={8} placeholder="Nhập nội dung bài viết" />
                {errors.noiDung && <p className="text-sm text-destructive">{errors.noiDung.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <ImageUpload
                  value={watch("hinhAnh") || ""}
                  onChange={(url) => setValue("hinhAnh", url)}
                  bucket="images"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold font-heading border border-slate-200 hover:bg-slate-50 transition-all">
                  Huỷ
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all disabled:opacity-50">
                  {submitting ? "Đang lưu..." : "Lưu bài viết"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table — giống di tích */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">Đang tải...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">Chưa có bài viết</TableCell></TableRow>
            ) : paginatedItems.map((bv, i) => (
              <TableRow key={bv.id}>
                <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">{bv.tieuDe}</TableCell>
                <TableCell>{bv.tacGia.fullName}</TableCell>
                <TableCell>{format(new Date(bv.createdAt), "dd/MM/yyyy", { locale: vi })}</TableCell>
                <TableCell>
                  <Badge variant={bv.trangThai ? "default" : "outline"} className="text-xs">
                    {bv.trangThai ? "Hiện" : "Ẩn"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(bv)}><HiPencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(bv.id)}><HiTrash className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog xoá — giống di tích */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalCount={filtered.length}
        onPageChange={setPage}
      />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Xác nhận xoá</DialogTitle>
            <DialogDescription>Bạn có chắc muốn xoá bài viết này? Hành động không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Huỷ</Button>
            <Button variant="destructive" onClick={handleDelete}>Xoá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
