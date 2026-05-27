"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LuArrowRight, LuLandmark, LuMapPin, LuSearch, LuX } from "react-icons/lu";
import Link from "next/link";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface MapItem {
  id: number;
  tenDiTich: string;
  diaChi: string;
  toaDoLat: number;
  toaDoLng: number;
  capDiTich: string;
  hinhAnhDaiDien: string | null;
  tenDanhMuc: string;
  slug?: string;
}

interface DanhMucItem {
  id: number;
  tenDanhMuc: string;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

export default function BanDoPage() {
  const [items, setItems] = useState<MapItem[]>([]);
  const [danhMucs, setDanhMucs] = useState<DanhMucItem[]>([]);
  const [filterCap, setFilterCap] = useState("all");
  const [filterDM, setFilterDM] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const handleCapChange = (value: string | null) => {
    setLoading(true);
    setFilterCap(value || "all");
  };

  const handleDanhMucChange = (value: string | null) => {
    setLoading(true);
    setFilterDM(value || "all");
  };

  useEffect(() => {
    fetch("/api/danhmuc").then((r) => r.json()).then(setDanhMucs).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterCap !== "all") params.set("capDiTich", filterCap);
    if (filterDM !== "all") params.set("danhMucId", filterDM);

    fetch(`/api/ditich/ban-do?${params}`)
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, [filterCap, filterDM]);

  const filteredItems = useMemo(() => {
    const keyword = normalizeSearch(searchTerm.trim());
    if (!keyword) return items;

    return items.filter((item) => {
      const content = normalizeSearch([
        item.tenDiTich,
        item.diaChi,
        item.tenDanhMuc,
        item.capDiTich === "CAP_QUOC_GIA" ? "quoc gia qg" : "tinh cap tinh",
      ].join(" "));

      return content.includes(keyword);
    });
  }, [items, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <div className="lg:w-[360px] shrink-0 space-y-4">
          <h1 className="text-xl font-bold">Bản đồ di tích</h1>

          <div className="space-y-2">
            <div className="relative">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm tên, địa chỉ di tích..."
                className="h-10 rounded-lg border-slate-200 bg-white pl-9 pr-9 text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Xóa tìm kiếm"
                >
                  <LuX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Select
              value={filterCap}
              onValueChange={handleCapChange}
              items={{ all: "Tất cả cấp", CAP_TINH: "Cấp tỉnh", CAP_QUOC_GIA: "Cấp quốc gia" }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cấp di tích" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp</SelectItem>
                <SelectItem value="CAP_TINH">Cấp tỉnh</SelectItem>
                <SelectItem value="CAP_QUOC_GIA">Cấp quốc gia</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterDM}
              onValueChange={handleDanhMucChange}
              items={Object.fromEntries([["all", "Tất cả danh mục"], ...danhMucs.map((dm) => [String(dm.id), dm.tenDanhMuc])])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {danhMucs.map((dm) => (
                  <SelectItem key={dm.id} value={String(dm.id)}>{dm.tenDanhMuc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">🔴 Quốc gia</span>
            <span className="flex items-center gap-1">🔵 Cấp tỉnh</span>
            <Badge variant="outline">{filteredItems.length} di tích</Badge>
          </div>

          <ScrollArea className="h-[calc(100%-15rem)] hidden lg:block">
            <div className="space-y-2.5 pr-2">
              {filteredItems.map((item) => (
                <Link key={item.id} href={`/di-tich/${item.slug || item.id}`} className="group block">
                  <Card className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-sm">
                    <CardContent className="p-3.5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-teal-100 bg-teal-50 text-teal-700">
                          <LuMapPin className="h-4 w-4" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <h2 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-900 line-clamp-2">
                              {item.tenDiTich}
                            </h2>
                            <Badge
                              variant={item.capDiTich === "CAP_QUOC_GIA" ? "default" : "secondary"}
                              className={
                                item.capDiTich === "CAP_QUOC_GIA"
                                  ? "h-6 rounded-full bg-teal-600 px-2.5 text-[11px] font-semibold text-white"
                                  : "h-6 rounded-full bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-700"
                              }
                            >
                              {item.capDiTich === "CAP_QUOC_GIA" ? "QG" : "Tỉnh"}
                            </Badge>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500 line-clamp-2">
                            {item.diaChi}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700">
                              <LuLandmark className="h-3 w-3 shrink-0" />
                              <span className="truncate">{item.tenDanhMuc}</span>
                            </span>
                            <LuArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-teal-600" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {!loading && filteredItems.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                  Không tìm thấy di tích phù hợp
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-lg overflow-hidden border min-h-[400px]">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <MapView items={filteredItems} />
          )}
        </div>
      </div>
    </div>
  );
}
