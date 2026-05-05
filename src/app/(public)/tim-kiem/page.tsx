"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DiTichCard from "@/components/ditich/DiTichCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HiSearch, HiX } from "react-icons/hi";
import type { DiTich, DanhMuc, HinhAnh } from "@prisma/client";

type DiTichItem = DiTich & { danhMuc: DanhMuc; hinhAnhs: HinhAnh[] };

interface DanhMucItem {
  id: number;
  tenDanhMuc: string;
}

export default function TimKiemPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          Đang tải...
        </div>
      }
    >
      <TimKiemPage />
    </Suspense>
  );
}

function TimKiemPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const paramDanhMuc = searchParams.get("danhMucId") || "all";
  const paramCap = searchParams.get("capDiTich") || "all";

  const [searchText, setSearchText] = useState(query);
  const [danhMucId, setDanhMucId] = useState(paramDanhMuc);
  const [capDiTich, setCapDiTich] = useState(paramCap);
  const [danhMucs, setDanhMucs] = useState<DanhMucItem[]>([]);

  const [results, setResults] = useState<DiTichItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/danhmuc")
      .then((r) => r.json())
      .then(setDanhMucs)
      .catch(() => {});
  }, []);

  const fetchResults = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchText) params.set("search", searchText);
    if (danhMucId !== "all") params.set("danhMucId", danhMucId);
    if (capDiTich !== "all") params.set("capDiTich", capDiTich);
    params.set("pageSize", "30");

    fetch(`/api/ditich?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.items || []);
        setTotalCount(data.totalCount || 0);
      })
      .finally(() => setLoading(false));
  }, [searchText, danhMucId, capDiTich]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const updateUrl = useCallback(
    (newQ: string, newDM: string, newCap: string) => {
      const params = new URLSearchParams();
      if (newQ) params.set("q", newQ);
      if (newDM !== "all") params.set("danhMucId", newDM);
      if (newCap !== "all") params.set("capDiTich", newCap);
      router.replace(`/tim-kiem?${params.toString()}`);
    },
    [router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(searchText, danhMucId, capDiTich);
  };

  const handleDanhMucChange = (value: string | null) => {
    const v = value || "all";
    setDanhMucId(v);
    updateUrl(searchText, v, capDiTich);
  };

  const handleCapChange = (value: string | null) => {
    const v = value || "all";
    setCapDiTich(v);
    updateUrl(searchText, danhMucId, v);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setDanhMucId("all");
    setCapDiTich("all");
    router.replace("/tim-kiem");
  };

  const hasFilters = searchText || danhMucId !== "all" || capDiTich !== "all";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Tìm kiếm di tích</h1>

        {/* Search & Filters */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nhập tên di tích, địa chỉ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Tìm kiếm</Button>
          </form>

          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={danhMucId}
              onValueChange={handleDanhMucChange}
              items={Object.fromEntries([["all", "Tất cả danh mục"], ...danhMucs.map((dm) => [String(dm.id), dm.tenDanhMuc])])}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {danhMucs.map((dm) => (
                  <SelectItem key={dm.id} value={String(dm.id)}>
                    {dm.tenDanhMuc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={capDiTich}
              onValueChange={handleCapChange}
              items={{ all: "Tất cả cấp", CAP_TINH: "Cấp tỉnh", CAP_QUOC_GIA: "Cấp quốc gia" }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Cấp di tích" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp</SelectItem>
                <SelectItem value="CAP_TINH">Cấp tỉnh</SelectItem>
                <SelectItem value="CAP_QUOC_GIA">Cấp quốc gia</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground"
              >
                <HiX className="mr-1" />
                Xoá bộ lọc
              </Button>
            )}
          </div>
        </div>

        {!loading && (
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary">{totalCount} kết quả</Badge>
            {query && (
              <span className="text-sm text-muted-foreground">
                cho &ldquo;{query}&rdquo;
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((dt) => (
            <DiTichCard key={dt.id} diTich={dt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">🔍</p>
          <p>Không tìm thấy di tích nào phù hợp.</p>
          {hasFilters && (
            <Button
              variant="link"
              onClick={handleClearFilters}
              className="mt-2"
            >
              Xoá bộ lọc và thử lại
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
