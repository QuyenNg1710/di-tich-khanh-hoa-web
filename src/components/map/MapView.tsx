"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const KHANH_HOA_CENTER: [number, number] = [12.2388, 109.1967];
const DEFAULT_ZOOM = 10;

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

interface Props {
  items: MapItem[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function MapView({ items, center, zoom, className }: Props) {
  return (
    <MapContainer
      center={center || KHANH_HOA_CENTER}
      zoom={zoom || DEFAULT_ZOOM}
      className={className || "h-full w-full"}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {items.map((item) => (
        <Marker
          key={item.id}
          position={[item.toaDoLat, item.toaDoLng]}
          icon={item.capDiTich === "CAP_QUOC_GIA" ? redIcon : blueIcon}
        >
          <Popup minWidth={220}>
            <div className="space-y-2">
              {item.hinhAnhDaiDien && (
                <img
                  src={item.hinhAnhDaiDien}
                  alt={item.tenDiTich}
                  className="w-full h-32 object-cover rounded"
                />
              )}
              <h3 className="font-bold text-sm">{item.tenDiTich}</h3>
              <p className="text-xs text-gray-600">{item.diaChi}</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={item.capDiTich === "CAP_QUOC_GIA" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {item.capDiTich === "CAP_QUOC_GIA" ? "Quốc gia" : "Cấp tỉnh"}
                </Badge>
                <span className="text-xs text-gray-500">{item.tenDanhMuc}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/di-tich/${(item as any).slug || item.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Xem chi tiết →
                </Link>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.toaDoLat},${item.toaDoLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline"
                >
                  Chỉ đường →
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
