"use client";

import { useEffect, useState } from "react";
import DiTichCard from "@/components/ditich/DiTichCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

export default function YeuThichPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/yeuthich")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(diTichId: number) {
    await fetch(`/api/yeuthich/${diTichId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.diTich.id !== diTichId));
    toast.success("Đã bỏ yêu thích");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold">Di tích yêu thích</h1>
        <Badge variant="secondary">{items.length}</Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <DiTichCard diTich={item.diTich} />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 left-2 z-10"
                onClick={(e) => { e.preventDefault(); handleRemove(item.diTich.id); }}
              >
                Bỏ yêu thích
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">💝</p>
          <p className="mb-4">Chưa có di tích yêu thích nào.</p>
          <Link href="/di-san-van-hoa">
            <Button>Khám phá di tích</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
