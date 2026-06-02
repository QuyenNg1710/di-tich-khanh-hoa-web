"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { LuCheck, LuExternalLink, LuTrash2 } from "react-icons/lu";

interface Review {
  id: number;
  diemSo: number;
  binhLuan: string | null;
  trangThai: boolean;
  createdAt: string;
  user: { fullName: string; email: string | null };
  diTich: { id: number; slug: string | null; tenDiTich: string };
}

const PAGE_SIZE = 10;

export default function AdminDanhGiaPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/danhgia?status=${status}&pageIndex=${page}&pageSize=${PAGE_SIZE}`)
      .then((res) => res.json())
      .then((data) => {
        const nextTotalPages = Math.max(1, data.totalPages || 1);
        setItems(data.items || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(nextTotalPages);
        if (page > nextTotalPages) {
          setPage(nextTotalPages);
        }
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  function handleStatusChange(value: string) {
    setLoading(true);
    setStatus(value);
    setPage(1);
  }

  async function fetchData(currentStatus = status, currentPage = page) {
    setLoading(true);
    const res = await fetch(`/api/danhgia?status=${currentStatus}&pageIndex=${currentPage}&pageSize=${PAGE_SIZE}`);
    const data = await res.json();
    const nextTotalPages = Math.max(1, data.totalPages || 1);
    setItems(data.items || []);
    setTotalCount(data.totalCount || 0);
    setTotalPages(nextTotalPages);
    if (currentPage > nextTotalPages) {
      setPage(nextTotalPages);
    }
    setLoading(false);
  }

  async function approveReview(id: number) {
    const res = await fetch(`/api/danhgia/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai: true }),
    });

    if (res.ok) {
      toast.success("Đã duyệt đánh giá");
      fetchData();
    } else {
      toast.error("Không thể duyệt đánh giá");
    }
  }

  async function deleteReview(id: number) {
    if (!window.confirm("Bạn có chắc muốn xoá đánh giá này?")) return;

    const res = await fetch(`/api/danhgia/${id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("Đã xoá đánh giá");
      fetchData();
    } else {
      toast.error("Không thể xoá đánh giá");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] font-heading">Quản lý đánh giá</h1>
          <p className="text-sm text-slate-500 mt-1">{totalCount} đánh giá trong bộ lọc hiện tại</p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          {[
            { value: "pending", label: "Chờ duyệt" },
            { value: "approved", label: "Đã duyệt" },
            { value: "all", label: "Tất cả" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleStatusChange(item.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                status === item.value ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải đánh giá...</div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {items.map((review) => (
              <div key={review.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{review.user.fullName}</span>
                      <span className="text-sm text-amber-500">{"★".repeat(review.diemSo)}</span>
                      <Badge variant={review.trangThai ? "default" : "secondary"}>
                        {review.trangThai ? "Đã duyệt" : "Chờ duyệt"}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                      </span>
                    </div>

                    <Link
                      href={`/di-tich/${review.diTich.slug || review.diTich.id}`}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
                    >
                      {review.diTich.tenDiTich}
                      <LuExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                      {review.binhLuan || "Người dùng chỉ đánh giá sao, không nhập bình luận."}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {!review.trangThai && (
                      <Button size="sm" onClick={() => approveReview(review.id)}>
                        <LuCheck className="h-4 w-4" />
                        Duyệt
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => deleteReview(review.id)}>
                      <LuTrash2 className="h-4 w-4" />
                      Xoá
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500">Không có đánh giá nào.</div>
        )}
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </div>
  );
}
