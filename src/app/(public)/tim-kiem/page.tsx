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

const khuVucs = [
  "Nha Trang",
  "Cam Ranh",
  "Ninh Hòa",
  "Diên Khánh",
  "Cam Lâm",
  "Khánh Vĩnh",
  "Khánh Sơn",
  "Vạn Ninh",
  "Trường Sa",
];

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
  const paramKhuVuc = searchParams.get("khuVuc") || "all";

  const [searchText, setSearchText] = useState(query);
  const [danhMucId, setDanhMucId] = useState(paramDanhMuc);
  const [khuVuc, setKhuVuc] = useState(paramKhuVuc);
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
    const params = new URLSearchParams();
    if (searchText) params.set("search", searchText);
    if (danhMucId !== "all") params.set("danhMucId", danhMucId);
    if (khuVuc !== "all") params.set("khuVuc", khuVuc);
    params.set("pageSize", "30");

    fetch(`/api/ditich?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.items || []);
        setTotalCount(data.totalCount || 0);
      })
      .finally(() => setLoading(false));
  }, [searchText, danhMucId, khuVuc]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const updateUrl = useCallback(
    (newQ: string, newDM: string, newKhuVuc: string) => {
      const params = new URLSearchParams();
      if (newQ) params.set("q", newQ);
      if (newDM !== "all") params.set("danhMucId", newDM);
      if (newKhuVuc !== "all") params.set("khuVuc", newKhuVuc);
      router.replace(`/tim-kiem?${params.toString()}`);
    },
    [router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    updateUrl(searchText, danhMucId, khuVuc);
  };

  const handleDanhMucChange = (value: string | null) => {
    const v = value || "all";
    setLoading(true);
    setDanhMucId(v);
    updateUrl(searchText, v, khuVuc);
  };

  const handleKhuVucChange = (value: string | null) => {
    const v = value || "all";
    setLoading(true);
    setKhuVuc(v);
    updateUrl(searchText, danhMucId, v);
  };

  const handleClearFilters = () => {
    setLoading(true);
    setSearchText("");
    setDanhMucId("all");
    setKhuVuc("all");
    router.replace("/tim-kiem");
  };

  const hasFilters = searchText || danhMucId !== "all" || khuVuc !== "all";

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
              value={khuVuc}
              onValueChange={handleKhuVucChange}
              items={Object.fromEntries([["all", "Tất cả khu vực"], ...khuVucs.map((item) => [item, item])])}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {khuVucs.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
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
