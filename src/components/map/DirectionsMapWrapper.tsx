"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DirectionsMap = dynamic(() => import("@/components/map/DirectionsMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

interface Props {
  destLat: number;
  destLng: number;
  destName: string;
}

export default function DirectionsMapWrapper(props: Props) {
  return <DirectionsMap {...props} />;
}
