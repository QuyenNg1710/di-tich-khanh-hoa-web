"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function HomeMapPreview({ items }: { items: MapItem[] }) {
  return <MapView items={items} zoom={9} />;
}
