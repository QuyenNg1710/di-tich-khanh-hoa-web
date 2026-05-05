"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { HiPencil, HiTrash, HiPlus, HiSearch } from "react-icons/hi";

interface DiTichItem {
  id: number;
  tenDiTich: string;
  diaChi: string;
  capDiTich: string;
  trangThai: boolean;
  luotXem: number;
  danhMuc: { tenDanhMuc: string };
}

export default function AdminDiTichPage() {
  const [items, setItems] = useState<DiTichItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [page, search]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams({ pageIndex: String(page), pageSize: "10" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/ditich?${params}`);
    const data = await res.json();
    setItems(data.items || []);
    setTotalCount(data.totalCount || 0);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/ditich/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xoá di tích");
      fetchData();
    } else {
      toast.error("Không thể xoá");
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] font-heading">Quản lý Di tích</h1>
          <p className="text-sm text-slate-500 mt-1">{totalCount} di tích trong hệ thống</p>
        </div>
        <Link href="/admin/di-tich/them-moi">
          <button className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all active:scale-95">
            <HiPlus className="h-4 w-4" /> Thêm mới
          </button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <HiSearch className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input placeholder="Tìm theo tên di tích..." className="pl-9 bg-[#e0e3e5] border-0 rounded-2xl focus:ring-[#00685f]/20" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tên di tích</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Cấp</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
            ) : items.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{item.tenDiTich}</TableCell>
                <TableCell>{item.danhMuc.tenDanhMuc}</TableCell>
                <TableCell>
                  <Badge variant={item.capDiTich === "CAP_QUOC_GIA" ? "default" : "secondary"} className="text-xs">
                    {item.capDiTich === "CAP_QUOC_GIA" ? "QG" : "Tỉnh"}
                  </Badge>
                </TableCell>
                <TableCell>{item.luotXem}</TableCell>
                <TableCell>
                  <Badge variant={item.trangThai ? "default" : "outline"} className="text-xs">
                    {item.trangThai ? "Hiện" : "Ẩn"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/admin/di-tich/${item.id}`}>
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

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Tổng: {totalCount}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
          <Button variant="outline" size="sm" disabled={items.length < 10} onClick={() => setPage(page + 1)}>Sau</Button>
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>Bạn có chắc muốn xoá di tích này? Hành động không thể hoàn tác.</DialogDescription>
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
