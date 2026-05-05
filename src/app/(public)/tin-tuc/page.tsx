"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface BaiViet {
  id: number;
  slug: string;
  tieuDe: string;
  noiDung: string;
  hinhAnh: string | null;
  createdAt: string;
  tacGia: { fullName: string };
}

export default function TinTucPage() {
  const [items, setItems] = useState<BaiViet[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/baiviet?pageIndex=${page}&pageSize=9`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tin tức & Bài viết</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[250px] rounded-xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((bv) => (
              <Link key={bv.id} href={`/tin-tuc/${bv.slug || bv.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  {bv.hinhAnh && (
                    <img src={bv.hinhAnh} alt={bv.tieuDe} className="w-full h-40 object-cover rounded-t-lg" />
                  )}
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-2">{bv.tieuDe}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {bv.noiDung.replace(/<[^>]*>/g, "").slice(0, 150)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(bv.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
              <span className="px-3 py-1.5 text-sm">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">📰</p>
          <p>Chưa có bài viết nào.</p>
        </div>
      )}
    </div>
  );
}
