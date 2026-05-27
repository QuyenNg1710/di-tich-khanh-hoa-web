"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { HiLocationMarker, HiMail, HiPencil, HiPhone, HiPlus, HiSearch, HiTrash } from "react-icons/hi";

interface DonViQuanLyItem {
  id: number;
  tenDonVi: string;
  diaChi: string | null;
  dienThoai: string | null;
  email: string | null;
  hinhAnh: string | null;
  trangThai: boolean;
  _count?: { diTichs: number };
}

export default function DonViQuanLyPage() {
  const [items, setItems] = useState<DonViQuanLyItem[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [search]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams({ includeHidden: "true" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/don-vi-quan-ly?${params}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/don-vi-quan-ly/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xoá đơn vị quản lý");
      fetchData();
    } else {
      toast.error("Không thể xoá đơn vị quản lý");
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] font-heading">Đơn vị quản lý</h1>
          <p className="text-sm text-slate-500 mt-1">{items.length} đơn vị trong hệ thống</p>
        </div>
        <Link href="/admin/don-vi-quan-ly/them-moi">
          <button className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all active:scale-95">
            <HiPlus className="h-4 w-4" /> Thêm mới
          </button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <HiSearch className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Tìm tên đơn vị, địa chỉ..."
          className="pl-9 bg-[#e0e3e5] border-0 rounded-2xl focus:ring-[#00685f]/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đơn vị</TableHead>
              <TableHead>Thông tin liên hệ</TableHead>
              <TableHead>Số di tích</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-24">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.hinhAnh ? (
                      <img src={item.hinhAnh} alt={item.tenDonVi} className="h-12 w-16 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <div className="h-12 w-16 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-semibold">
                        DV
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{item.tenDonVi}</p>
                      <p className="text-xs text-slate-500">Mã đơn vị: {item.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm text-slate-600">
                    {item.diaChi && <p className="flex items-center gap-1.5"><HiLocationMarker className="text-slate-400" />{item.diaChi}</p>}
                    {item.dienThoai && <p className="flex items-center gap-1.5"><HiPhone className="text-slate-400" />{item.dienThoai}</p>}
                    {item.email && <p className="flex items-center gap-1.5"><HiMail className="text-slate-400" />{item.email}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/di-tich?donViQuanLy=${encodeURIComponent(item.tenDonVi)}`}
                    className="font-medium text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    {item._count?.diTichs || 0} di tích
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={item.trangThai ? "default" : "outline"} className="text-xs">
                    {item.trangThai ? "Hiện" : "Ẩn"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/admin/don-vi-quan-ly/${item.id}`}>
                      <Button variant="ghost" size="icon-sm"><HiPencil className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(item.id)}>
                      <HiTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>Đơn vị sẽ được chuyển sang trạng thái ẩn, các di tích đang liên kết vẫn được giữ nguyên.</DialogDescription>
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
