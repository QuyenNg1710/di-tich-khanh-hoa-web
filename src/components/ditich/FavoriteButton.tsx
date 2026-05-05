"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HiHeart, HiOutlineHeart } from "react-icons/hi";

interface Props {
  diTichId: number;
}

export default function FavoriteButton({ diTichId }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/yeuthich")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((items) => {
        if (Array.isArray(items)) {
          setFavorited(items.some((i: any) => i.diTichId === diTichId));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [diTichId]);

  async function toggle() {
    setLoading(true);
    const method = favorited ? "DELETE" : "POST";
    const res = await fetch(`/api/yeuthich/${diTichId}`, { method });

    if (res.status === 401) {
      toast.error("Vui lòng đăng nhập để sử dụng chức năng này");
      setLoading(false);
      return;
    }

    if (res.ok || res.status === 409) {
      setFavorited(!favorited);
      toast.success(favorited ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích");
    }
    setLoading(false);
  }

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {favorited ? <HiHeart className="mr-1.5 text-red-500" /> : <HiOutlineHeart className="mr-1.5" />}
      {favorited ? "Đã yêu thích" : "Yêu thích"}
    </Button>
  );
}
