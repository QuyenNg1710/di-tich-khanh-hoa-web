"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { danhMucSchema, type DanhMucInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { toast } from "sonner";
import { HiPencil, HiTrash, HiPlus } from "react-icons/hi";

interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  moTa: string | null;
  thuTu: number;
  trangThai: boolean;
  _count: { diTichs: number };
}

const PAGE_SIZE = 10;

export default function AdminDanhMucPage() {
  const [items, setItems] = useState<DanhMuc[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DanhMucInput>({
    resolver: zodResolver(danhMucSchema),
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/danhmuc");
    setItems(await res.json());
    setPage(1);
    setLoading(false);
  }

  function openCreate() {
    reset({ tenDanhMuc: "", moTa: "", thuTu: 0 });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(dm: DanhMuc) {
    reset({ tenDanhMuc: dm.tenDanhMuc, moTa: dm.moTa || "", thuTu: dm.thuTu });
    setEditId(dm.id);
    setShowForm(true);
  }

  async function onSubmit(data: DanhMucInput) {
    setSubmitting(true);
    const url = editId ? `/api/danhmuc/${editId}` : "/api/danhmuc";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(editId ? "Cập nhật thành công" : "Thêm danh mục thành công");
      setShowForm(false);
      setEditId(null);
      reset({ tenDanhMuc: "", moTa: "", thuTu: 0 });
      fetchData();
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/danhmuc/${deleteId}`, { method: "DELETE" });
    toast.success("Đã xoá danh mục");
    setDeleteId(null);
    fetchData();
  }

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginatedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] font-heading">Quản lý Danh mục</h1>
          <p className="text-sm text-slate-500 mt-1">{items.length} danh mục trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all active:scale-95"
        >
          <HiPlus className="h-4 w-4" /> Thêm mới
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="glass-card rounded-2xl border-white/20">
          <CardHeader>
            <CardTitle className="text-base font-heading">
              {editId ? "Sửa danh mục" : "Thêm danh mục mới"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên danh mục *</Label>
                  <Input {...register("tenDanhMuc")} placeholder="VD: Chùa, Đình, Tháp..." />
                  {errors.tenDanhMuc && <p className="text-sm text-destructive">{errors.tenDanhMuc.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Thứ tự</Label>
                  <Input type="number" {...register("thuTu", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Input {...register("moTa")} placeholder="Mô tả ngắn" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold font-heading border border-slate-200 hover:bg-slate-50 transition-all">
                  Huỷ
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all disabled:opacity-50">
                  {submitting ? "Đang lưu..." : "Lưu danh mục"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Thứ tự</TableHead>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số di tích</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">Đang tải...</TableCell></TableRow>
            ) : paginatedItems.map((dm) => (
              <TableRow key={dm.id}>
                <TableCell>{dm.thuTu}</TableCell>
                <TableCell className="font-medium">{dm.tenDanhMuc}</TableCell>
                <TableCell className="text-muted-foreground">{dm.moTa || "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{dm._count.diTichs}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={dm.trangThai ? "default" : "outline"} className="text-xs">
                    {dm.trangThai ? "Hiện" : "Ẩn"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(dm)}><HiPencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(dm.id)}><HiTrash className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Tổng: {items.length}</span>
      </div>

      {/* Dialog xoá */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalCount={items.length}
        onPageChange={setPage}
      />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Xác nhận xoá</DialogTitle>
            <DialogDescription>Bạn có chắc muốn xoá danh mục này? Hành động không thể hoàn tác.</DialogDescription>
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
