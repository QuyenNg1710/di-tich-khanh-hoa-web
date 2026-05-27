"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  donViQuanLy: string | null;
  donViQuanLyInfo: { tenDonVi: string } | null;
  capDiTich: string;
  trangThai: boolean;
  luotXem: number;
  danhMuc: { tenDanhMuc: string };
}

interface DanhMucItem {
  id: number;
  tenDanhMuc: string;
}

interface DonViQuanLyItem {
  id: number;
  tenDonVi: string;
}

function getInitialParam(name: string) {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) || "";
}

function getInitialPage() {
  const pageParam = Number(getInitialParam("page"));
  return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
}

export default function AdminDiTichPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<DiTichItem[]>([]);
  const [danhMucs, setDanhMucs] = useState<DanhMucItem[]>([]);
  const [donVis, setDonVis] = useState<DonViQuanLyItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(getInitialPage);
  const [search, setSearch] = useState(() => getInitialParam("search"));
  const [filterDanhMuc, setFilterDanhMuc] = useState(() => getInitialParam("danhMucId") || "all");
  const [filterCap, setFilterCap] = useState(() => getInitialParam("capDiTich") || "all");
  const [filterDonVi, setFilterDonVi] = useState(() => getInitialParam("donViQuanLy") || "all");
  const [filterTrangThai, setFilterTrangThai] = useState(() => getInitialParam("trangThai") || "true");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/danhmuc").then((res) => res.json()),
      fetch("/api/don-vi-quan-ly").then((res) => res.json()),
    ]).then(([danhMucData, donViData]) => {
      if (Array.isArray(danhMucData)) setDanhMucs(danhMucData);
      if (Array.isArray(donViData)) setDonVis(donViData);
    });
  }, []);

  useEffect(() => {
    const pageParam = Number(searchParams.get("page"));
    const pageFromUrl = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const searchFromUrl = searchParams.get("search") || "";
    const danhMucFromUrl = searchParams.get("danhMucId") || "all";
    const capFromUrl = searchParams.get("capDiTich") || "all";
    const donViFromUrl = searchParams.get("donViQuanLy") || "all";
    const trangThaiFromUrl = searchParams.get("trangThai") || "true";

    if (page !== pageFromUrl) setPage(pageFromUrl);
    if (search !== searchFromUrl) setSearch(searchFromUrl);
    if (filterDanhMuc !== danhMucFromUrl) setFilterDanhMuc(danhMucFromUrl);
    if (filterCap !== capFromUrl) setFilterCap(capFromUrl);
    if (filterDonVi !== donViFromUrl) setFilterDonVi(donViFromUrl);
    if (filterTrangThai !== trangThaiFromUrl) setFilterTrangThai(trangThaiFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const nextUrl = getCurrentListUrl();

    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
    window.sessionStorage.setItem("adminDiTichReturnUrl", nextUrl);

    fetchData();
  }, [page, search, filterDanhMuc, filterCap, filterDonVi, filterTrangThai]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams({ pageIndex: String(page), pageSize: "10" });
    if (search) params.set("search", search);
    if (filterDanhMuc !== "all") params.set("danhMucId", filterDanhMuc);
    if (filterCap !== "all") params.set("capDiTich", filterCap);
    if (filterDonVi !== "all") params.set("donViQuanLy", filterDonVi);
    if (filterTrangThai !== "true") params.set("trangThai", filterTrangThai);
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

  async function handleToggleStatus(item: DiTichItem) {
    const nextStatus = !item.trangThai;
    setUpdatingStatusId(item.id);

    const res = await fetch(`/api/ditich/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai: nextStatus }),
    });

    if (res.ok) {
      toast.success(nextStatus ? "Đã hiển thị di tích" : "Đã ẩn di tích");
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, trangThai: nextStatus } : currentItem
        )
      );
      fetchData();
    } else {
      toast.error("Không thể cập nhật trạng thái");
    }

    setUpdatingStatusId(null);
  }

  function getEditHref(id: number) {
    const params = new URLSearchParams({ returnUrl: getCurrentListUrl() });
    return `/admin/di-tich/${id}?${params.toString()}`;
  }

  function getCurrentListUrl() {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (search) params.set("search", search);
    if (filterDanhMuc !== "all") params.set("danhMucId", filterDanhMuc);
    if (filterCap !== "all") params.set("capDiTich", filterCap);
    if (filterDonVi !== "all") params.set("donViQuanLy", filterDonVi);
    if (filterTrangThai !== "true") params.set("trangThai", filterTrangThai);
    const query = params.toString();
    return query ? `/admin/di-tich?${query}` : "/admin/di-tich";
  }

  function rememberReturnUrl() {
    window.sessionStorage.setItem("adminDiTichReturnUrl", getCurrentListUrl());
  }

  function resetFilters() {
    setSearch("");
    setFilterDanhMuc("all");
    setFilterCap("all");
    setFilterDonVi("all");
    setFilterTrangThai("true");
    setPage(1);
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

      <div className="grid items-center gap-3 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_88px]">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Tìm theo tên, địa chỉ..." className="h-10 w-full rounded-full border-0 bg-[#e0e3e5] pl-10 pr-4 text-sm focus:ring-[#00685f]/20" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={filterDanhMuc} onChange={(e) => { setFilterDanhMuc(e.target.value); setPage(1); }} className="h-10 w-full rounded-full border-0 bg-[#e0e3e5] px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00685f]/20">
          <option value="all">Tất cả danh mục</option>
          {danhMucs.map((danhMuc) => (
            <option key={danhMuc.id} value={danhMuc.id}>{danhMuc.tenDanhMuc}</option>
          ))}
        </select>
        <select value={filterCap} onChange={(e) => { setFilterCap(e.target.value); setPage(1); }} className="h-10 w-full rounded-full border-0 bg-[#e0e3e5] px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00685f]/20">
          <option value="all">Tất cả cấp</option>
          <option value="CAP_TINH">Cấp tỉnh</option>
          <option value="CAP_QUOC_GIA">Cấp quốc gia</option>
        </select>
        <select value={filterDonVi} onChange={(e) => { setFilterDonVi(e.target.value); setPage(1); }} className="h-10 w-full rounded-full border-0 bg-[#e0e3e5] px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00685f]/20">
          <option value="all">Tất cả đơn vị</option>
          {donVis.map((donVi) => (
            <option key={donVi.id} value={donVi.tenDonVi}>{donVi.tenDonVi}</option>
          ))}
        </select>
        <select value={filterTrangThai} onChange={(e) => { setFilterTrangThai(e.target.value); setPage(1); }} className="h-10 w-full rounded-full border-0 bg-[#e0e3e5] px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00685f]/20">
          <option value="true">Đang hiển thị</option>
          <option value="false">Đang ẩn</option>
          <option value="all">Tất cả trạng thái</option>
        </select>
        <Button variant="outline" className="h-10 w-full rounded-full px-4 text-sm font-semibold" onClick={resetFilters}>Đặt lại</Button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tên di tích</TableHead>
              <TableHead>Đơn vị quản lý</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Cấp</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
            ) : items.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{item.tenDiTich}</TableCell>
                <TableCell className="max-w-[180px] truncate text-slate-600">{item.donViQuanLyInfo?.tenDonVi || item.donViQuanLy || "Chưa cập nhật"}</TableCell>
                <TableCell>{item.danhMuc.tenDanhMuc}</TableCell>
                <TableCell>
                  <Badge variant={item.capDiTich === "CAP_QUOC_GIA" ? "default" : "secondary"} className="text-xs">
                    {item.capDiTich === "CAP_QUOC_GIA" ? "QG" : "Tỉnh"}
                  </Badge>
                </TableCell>
                <TableCell>{item.luotXem}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    disabled={updatingStatusId === item.id}
                    onClick={() => handleToggleStatus(item)}
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                    title={item.trangThai ? "Bấm để ẩn di tích" : "Bấm để hiển thị di tích"}
                  >
                    <Badge variant={item.trangThai ? "default" : "outline"} className="cursor-pointer text-xs">
                      {updatingStatusId === item.id ? "Đang lưu" : item.trangThai ? "Hiện" : "Ẩn"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={getEditHref(item.id)} onClick={rememberReturnUrl}>
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
