"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { HiLocationMarker } from "react-icons/hi";
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
}

interface DanhMucItem {
  id: number;
  tenDanhMuc: string;
}

export default function BanDoPage() {
  const [items, setItems] = useState<MapItem[]>([]);
  const [danhMucs, setDanhMucs] = useState<DanhMucItem[]>([]);
  const [filterCap, setFilterCap] = useState("all");
  const [filterDM, setFilterDM] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/danhmuc").then((r) => r.json()).then(setDanhMucs).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCap !== "all") params.set("capDiTich", filterCap);
    if (filterDM !== "all") params.set("danhMucId", filterDM);

    fetch(`/api/ditich/ban-do?${params}`)
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, [filterCap, filterDM]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <div className="lg:w-[300px] shrink-0 space-y-4">
          <h1 className="text-xl font-bold">Bản đồ di tích</h1>

          <div className="space-y-2">
            <Select
              value={filterCap}
              onValueChange={(v) => setFilterCap(v || "all")}
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
              onValueChange={(v) => setFilterDM(v || "all")}
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
            <Badge variant="outline">{items.length} di tích</Badge>
          </div>

          <ScrollArea className="h-[calc(100%-12rem)] hidden lg:block">
            <div className="space-y-2 pr-2">
              {items.map((item) => (
                <Link key={item.id} href={`/di-tich/${(item as any).slug || item.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <p className="font-medium text-sm line-clamp-1">{item.tenDiTich}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <HiLocationMarker className="shrink-0" />
                        <span className="line-clamp-1">{item.diaChi}</span>
                      </p>
                      <Badge
                        variant={item.capDiTich === "CAP_QUOC_GIA" ? "default" : "secondary"}
                        className="text-xs mt-1"
                      >
                        {item.capDiTich === "CAP_QUOC_GIA" ? "QG" : "Tỉnh"}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-lg overflow-hidden border min-h-[400px]">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <MapView items={items} />
          )}
        </div>
      </div>
    </div>
  );
}
