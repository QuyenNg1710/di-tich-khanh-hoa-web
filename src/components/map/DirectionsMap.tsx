"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { HiLocationMarker } from "react-icons/hi";

const destIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RouteInfo {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
}

interface Props {
  destLat: number;
  destLng: number;
  destName: string;
}

export default function DirectionsMap({ destLat, destLng, destName }: Props) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const hasLocated = useRef(false);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(loc);
        setLocating(false);
        hasLocated.current = true;
      },
      () => {
        setError("Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí trong trình duyệt.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    const [uLat, uLng] = userLocation;
    const url = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.code !== "Ok" || !data.routes?.length) {
          setError("Không tìm được tuyến đường. Vui lòng thử lại.");
          return;
        }

        const r = data.routes[0];
        const coords: [number, number][] = r.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
        );

        setRoute({
          coordinates: coords,
          distance: r.distance,
          duration: r.duration,
        });
      })
      .catch(() => {
        setError("Lỗi kết nối. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, [userLocation, destLat, destLng]);

  const formatDistance = (meters: number) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    if (hours > 0) return `${hours} giờ ${mins} phút`;
    return `${mins} phút`;
  };

  const openGoogleMaps = () => {
    const url = userLocation
      ? `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${destLat},${destLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
    window.open(url, "_blank");
  };

  const bounds: L.LatLngBoundsExpression | null =
    userLocation
      ? [userLocation, [destLat, destLng]]
      : null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button onClick={getUserLocation} disabled={locating} variant="outline" size="sm">
          <HiLocationMarker className="mr-2" />
          {locating ? "Đang định vị..." : hasLocated.current ? "Cập nhật vị trí" : "Lấy vị trí của tôi"}
        </Button>

        <Button onClick={openGoogleMaps} variant="outline" size="sm">
          Mở Google Maps
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground">Đang tìm tuyến đường...</p>
      )}

      {/* Route Info */}
      {route && (
        <div className="flex gap-6 p-3 bg-muted/50 rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">Khoảng cách: </span>
            <span className="font-semibold">{formatDistance(route.distance)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Thời gian: </span>
            <span className="font-semibold">~{formatDuration(route.duration)}</span>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapContainer
          center={[destLat, destLng]}
          zoom={userLocation ? 10 : 15}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Destination marker */}
          <Marker position={[destLat, destLng]} icon={destIcon}>
            <Popup>{destName}</Popup>
          </Marker>

          {/* User marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>Vị trí của bạn</Popup>
            </Marker>
          )}

          {/* Route polyline */}
          {route && (
            <Polyline
              positions={route.coordinates}
              color="#2563eb"
              weight={5}
              opacity={0.8}
            />
          )}

          {/* Fit bounds when we have both points */}
          {bounds && <FitBounds bounds={bounds} />}
        </MapContainer>
      </div>

      {!userLocation && !error && (
        <p className="text-sm text-muted-foreground text-center">
          Nhấn &ldquo;Lấy vị trí của tôi&rdquo; để xem tuyến đường đến di tích.
        </p>
      )}
    </div>
  );
}
