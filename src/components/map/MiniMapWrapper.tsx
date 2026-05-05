"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function MiniMapWrapper(props: Props) {
  return <MiniMap {...props} />;
}
