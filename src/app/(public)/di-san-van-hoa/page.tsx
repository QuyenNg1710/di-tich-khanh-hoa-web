"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DiTichCard from "@/components/ditich/DiTichCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { DiTich, DanhMuc, HinhAnh } from "@prisma/client";

type DiTichItem = DiTich & { danhMuc: DanhMuc; hinhAnhs: HinhAnh[] };

interface PagedResult {
  items: DiTichItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

interface DanhMucItem extends DanhMuc {
  _count: { diTichs: number };
}

interface CapCounts {
  all: number;
  CAP_TINH: number;
  CAP_QUOC_GIA: number;
}

export default function DiSanVanHoaPageWrapper() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><Skeleton className="h-[600px]" /></div>}>
      <DiSanVanHoaPage />
    </Suspense>
  );
}

function DiSanVanHoaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<PagedResult | null>(null);
  const [danhMucs, setDanhMucs] = useState<DanhMucItem[]>([]);
  const [capCounts, setCapCounts] = useState<CapCounts>({ all: 0, CAP_TINH: 0, CAP_QUOC_GIA: 0 });
  const [loading, setLoading] = useState(true);

  const capDiTich = searchParams.get("cap") || "";
  const danhMucId = searchParams.get("danhMuc") || "";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const params = new URLSearchParams();
    if (capDiTich) params.set("capDiTich", capDiTich);
    if (danhMucId) params.set("danhMucId", danhMucId);
    params.set("pageIndex", String(page));
    params.set("pageSize", "9");

    fetch(`/api/ditich?${params}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [capDiTich, danhMucId, page]);

  useEffect(() => {
    fetch("/api/danhmuc").then((r) => r.json()).then(setDanhMucs).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/ditich?pageSize=1").then((r) => r.json()),
      fetch("/api/ditich?pageSize=1&capDiTich=CAP_TINH").then((r) => r.json()),
      fetch("/api/ditich?pageSize=1&capDiTich=CAP_QUOC_GIA").then((r) => r.json()),
    ])
      .then(([all, tinh, quocGia]) => {
        setCapCounts({
          all: all.totalCount || 0,
          CAP_TINH: tinh.totalCount || 0,
          CAP_QUOC_GIA: quocGia.totalCount || 0,
        });
      })
      .catch(() => {});
  }, []);

  function updateParam(key: string, value: string) {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/di-san-van-hoa?${params}`);
  }

  function updateCap(value: string) {
    updateParam("cap", value === "all" ? "" : value);
  }

  function goToPage(p: number) {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/di-san-van-hoa?${params}`);
  }

  function getVisiblePages(totalPages: number, currentPage: number) {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  const capOptions = [
    { value: "all", label: "Tất cả", count: capCounts.all },
    { value: "CAP_QUOC_GIA", label: "Cấp quốc gia", count: capCounts.CAP_QUOC_GIA },
    { value: "CAP_TINH", label: "Cấp tỉnh", count: capCounts.CAP_TINH },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#191c1e] font-heading mb-2">Di sản văn hoá</h1>
      <p className="text-sm text-slate-500 mb-6">Khám phá các di tích lịch sử trên địa bàn tỉnh Khánh Hòa</p>

      {/* Filters */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full grid-cols-1 gap-2 rounded-xl bg-slate-50 p-2 sm:grid-cols-3 lg:w-[720px]">
            {capOptions.map((option) => {
              const active = (capDiTich || "all") === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateCap(option.value)}
                  className={`flex h-12 items-center justify-between gap-3 rounded-lg px-4 text-left transition-all ${
                    active
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-transparent text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-bold">{option.label}</span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-white text-teal-700" : "bg-white text-slate-700"}`}>
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full lg:w-72">
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Lọc theo danh mục</label>
            <Select
              value={danhMucId || "all"}
              onValueChange={(v) => updateParam("danhMuc", !v || v === "all" ? "" : v)}
              items={Object.fromEntries([["all", "Tất cả danh mục"], ...danhMucs.map((dm) => [String(dm.id), `${dm.tenDanhMuc} (${dm._count.diTichs})`])])}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {danhMucs.map((dm) => (
                  <SelectItem key={dm.id} value={String(dm.id)}>
                    {dm.tenDanhMuc} ({dm._count.diTichs})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[380px] rounded-3xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Hiển thị {data.items.length} / {data.totalCount} di tích
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.items.map((dt) => (
              <DiTichCard key={dt.id} diTich={dt} />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Trang trước">
                &lt;
              </Button>
              {getVisiblePages(data.totalPages, page).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => goToPage(page + 1)} aria-label="Trang sau">
                &gt;
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">🏛️</p>
          <p>Không tìm thấy di tích nào.</p>
        </div>
      )}
    </div>
  );
}
