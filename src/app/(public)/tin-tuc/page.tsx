"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { LuCalendarDays, LuNewspaper, LuSearch, LuUserRound } from "react-icons/lu";

interface BaiViet {
  id: number;
  slug: string | null;
  tieuDe: string;
  noiDung: string;
  hinhAnh: string | null;
  createdAt: string;
  tacGia: { fullName: string };
}

const categories = [
  "Tin tức sự kiện",
  "Hoạt động bảo tồn",
  "Lễ hội",
  "Di sản văn hoá",
  "Nghiên cứu",
];

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function getCategory(post: BaiViet) {
  const content = `${post.tieuDe} ${post.noiDung}`.toLowerCase();
  if (content.includes("lễ hội") || content.includes("lễ ")) return "Lễ hội";
  if (content.includes("bảo tồn") || content.includes("tu bổ")) return "Hoạt động bảo tồn";
  if (content.includes("nghiên cứu") || content.includes("khảo cổ")) return "Nghiên cứu";
  if (content.includes("di sản") || content.includes("văn hóa")) return "Di sản văn hoá";
  return "Tin tức sự kiện";
}

export default function TinTucPage() {
  const [items, setItems] = useState<BaiViet[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const pageSize = 6;

  useEffect(() => {
    fetch("/api/baiviet?pageIndex=1&pageSize=50")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesKeyword =
        !keyword ||
        item.tieuDe.toLowerCase().includes(keyword) ||
        stripHtml(item.noiDung).toLowerCase().includes(keyword);
      const matchesCategory = category === "all" || getCategory(item) === category;

      return matchesKeyword && matchesCategory;
    });
  }, [items, search, category]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  const featuredItems = items.slice(0, 4);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <span className="text-sm font-semibold uppercase text-orange-600">Tin tức</span>
          <h1 className="mt-1 text-3xl font-bold text-slate-900 font-heading">Tin tức sự kiện</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cập nhật các bài viết, hoạt động và thông tin mới về di tích, di sản văn hoá trong những năm gần đây.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <main className="space-y-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-40 rounded-xl" />
              ))
            ) : pagedItems.length > 0 ? (
              pagedItems.map((post) => {
                const imageUrl = post.hinhAnh;
                const excerpt = stripHtml(post.noiDung).slice(0, 180);

                return (
                  <Link key={post.id} href={`/tin-tuc/${post.slug || post.id}`} className="group block">
                    <article className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-teal-200 hover:shadow-sm sm:grid-cols-[240px_1fr]">
                      <div className="overflow-hidden rounded-lg bg-teal-50">
                        {imageUrl ? (
                          <div
                            role="img"
                            aria-label={post.tieuDe}
                            className="h-44 bg-cover bg-center transition-transform duration-300 group-hover:scale-105 sm:h-full"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center text-teal-700 sm:h-full">
                            <LuNewspaper className="h-10 w-10" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 py-1">
                        <span className="text-xs font-semibold text-orange-500">{getCategory(post)}</span>
                        <h2 className="mt-2 text-xl font-semibold leading-7 text-slate-900 transition-colors group-hover:text-teal-700">
                          {post.tieuDe}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{excerpt}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <LuUserRound className="h-3.5 w-3.5" />
                            {post.tacGia?.fullName || "Quản trị viên"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <LuCalendarDays className="h-3.5 w-3.5" />
                            {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: vi })}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                Không tìm thấy bài viết phù hợp.
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  &lt;
                </Button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((p) => (
                  <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  &gt;
                </Button>
              </div>
            )}
          </main>

          <aside className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="relative">
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Tìm kiếm bài viết"
                  className="h-11 pr-10"
                />
                <LuSearch className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-900 font-heading">Danh mục tin</h2>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleCategory("all")}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    category === "all" ? "bg-teal-50 font-semibold text-teal-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Tất cả bài viết
                </button>
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleCategory(item)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      category === item ? "bg-teal-50 font-semibold text-teal-700" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-900 font-heading">Bài viết nổi bật</h2>
              <div className="mt-4 space-y-4">
                {featuredItems.map((post) => (
                  <Link key={post.id} href={`/tin-tuc/${post.slug || post.id}`} className="group flex gap-3">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded bg-teal-50">
                      {post.hinhAnh ? (
                        <div
                          role="img"
                          aria-label={post.tieuDe}
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.hinhAnh})` }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-teal-700">
                          <LuNewspaper className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-700 group-hover:text-teal-700">
                        {post.tieuDe}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: vi })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
