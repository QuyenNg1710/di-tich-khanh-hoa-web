"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Review {
  id: number;
  diemSo: number;
  binhLuan: string | null;
  createdAt: string;
  user: { id: string; fullName: string; avatarUrl: string | null };
}

interface Props {
  diTichId: number;
}

export default function ReviewSection({ diTichId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [diemTrungBinh, setDiemTrungBinh] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [diTichId]);

  async function fetchReviews() {
    const res = await fetch(`/api/ditich/${diTichId}/danhgia?limit=20`);
    const data = await res.json();
    setReviews(data.items || []);
    setTotalCount(data.totalCount || 0);
    setDiemTrungBinh(data.diemTrungBinh || 0);
  }

  async function handleSubmit() {
    if (!selectedStar) {
      toast.error("Vui lòng chọn số sao");
      return;
    }
    setSubmitting(true);

    const res = await fetch(`/api/ditich/${diTichId}/danhgia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diemSo: selectedStar, binhLuan: comment || undefined }),
    });

    if (res.status === 401) {
      toast.error("Vui lòng đăng nhập để đánh giá");
    } else if (res.status === 409) {
      toast.error("Bạn đã đánh giá di tích này rồi");
    } else if (res.ok) {
      toast.success("Đánh giá thành công!");
      setSelectedStar(0);
      setComment("");
      fetchReviews();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Đánh giá & Bình luận</h2>
        <span className="text-sm text-muted-foreground">
          ⭐ {diemTrungBinh.toFixed(1)} ({totalCount} đánh giá)
        </span>
      </div>

      {/* Form */}
      <div className="p-4 border rounded-lg space-y-3">
        <p className="text-sm font-medium">Viết đánh giá của bạn</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="text-2xl transition-transform hover:scale-110"
              onMouseEnter={() => setHoverStar(star)}
              onMouseLeave={() => setHoverStar(0)}
              onClick={() => setSelectedStar(star)}
            >
              {star <= (hoverStar || selectedStar) ? "⭐" : "☆"}
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Nhập bình luận (tuỳ chọn)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <Button onClick={handleSubmit} disabled={submitting} size="sm">
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </div>

      <Separator />

      {/* List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs">
                  {review.user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{review.user.fullName}</span>
                  <span className="text-xs">{"⭐".repeat(review.diemSo)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
                {review.binhLuan && (
                  <p className="text-sm mt-1">{review.binhLuan}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-6">Chưa có đánh giá nào.</p>
      )}
    </div>
  );
}
