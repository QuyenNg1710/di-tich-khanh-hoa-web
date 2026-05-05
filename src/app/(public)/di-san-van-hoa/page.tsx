"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DiTichCard from "@/components/ditich/DiTichCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [loading, setLoading] = useState(true);

  const capDiTich = searchParams.get("cap") || "";
  const danhMucId = searchParams.get("danhMuc") || "";
  const page = Number(searchParams.get("page")) || 1;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (capDiTich) params.set("capDiTich", capDiTich);
    if (danhMucId) params.set("danhMucId", danhMucId);
    params.set("pageIndex", String(page));
    params.set("pageSize", "9");

    const res = await fetch(`/api/ditich?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [capDiTich, danhMucId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetch("/api/danhmuc").then((r) => r.json()).then(setDanhMucs).catch(() => {});
  }, []);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/di-san-van-hoa?${params}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/di-san-van-hoa?${params}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#191c1e] font-heading mb-2">Di sản văn hoá</h1>
      <p className="text-sm text-slate-500 mb-6">Khám phá các di tích lịch sử trên địa bàn tỉnh Khánh Hòa</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs value={capDiTich || "all"} onValueChange={(v) => updateParam("cap", v === "all" ? "" : v)}>
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="CAP_TINH">Cấp tỉnh</TabsTrigger>
            <TabsTrigger value="CAP_QUOC_GIA">Cấp quốc gia</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={danhMucId || "all"}
          onValueChange={(v) => updateParam("danhMuc", !v || v === "all" ? "" : v)}
          items={Object.fromEntries([["all", "Tất cả danh mục"], ...danhMucs.map((dm) => [String(dm.id), `${dm.tenDanhMuc} (${dm._count.diTichs})`])])}
        >
          <SelectTrigger className="w-[200px]">
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
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                Trước
              </Button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => goToPage(page + 1)}>
                Sau
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
