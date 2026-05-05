import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import DiTichCard from "@/components/ditich/DiTichCard";
import Link from "next/link";
import { LuLandmark, LuMap, LuStar, LuEye, LuArrowRight, LuBookOpen, LuSearch } from "react-icons/lu";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [noiBat, tongDiTich, tongBaiViet, tinTuc] = await Promise.all([
    prisma.diTich.findMany({
      where: { trangThai: true },
      orderBy: { luotXem: "desc" },
      take: 3,
      include: { danhMuc: true, hinhAnhs: { take: 1, orderBy: { thuTu: "asc" } } },
    }),
    prisma.diTich.count({ where: { trangThai: true } }),
    prisma.baiViet.count({ where: { trangThai: true } }),
    prisma.baiViet.findMany({
      where: { trangThai: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const tongLuotXem = await prisma.diTich.aggregate({
    where: { trangThai: true },
    _sum: { luotXem: true },
  });

  return (
    <>
      <Header />
      <main className="flex-1 pt-28 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider font-heading">
                <LuLandmark className="h-3.5 w-3.5" />
                Di sản văn hoá tỉnh Khánh Hòa
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#191c1e] font-heading leading-tight">
                Khám phá <span className="text-teal-600">di tích</span> tỉnh Khánh Hòa
              </h1>
              <p className="text-lg text-[#3d4947] max-w-lg leading-relaxed">
                Tìm hiểu các di tích cấp tỉnh và cấp quốc gia, khám phá lịch sử và văn hóa trên bản đồ số tương tác.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/di-san-van-hoa"
                  className="inline-flex items-center gap-2 bg-[#00685f] hover:bg-[#008378] text-white px-8 py-4 rounded-2xl text-sm font-semibold font-heading active:scale-95 transition-all shadow-ambient-teal"
                >
                  Khám phá ngay <LuArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/ban-do"
                  className="inline-flex items-center gap-2 border-2 border-slate-200 hover:border-teal-200 text-[#191c1e] px-8 py-4 rounded-2xl text-sm font-semibold font-heading transition-all"
                >
                  <LuMap className="h-4 w-4" /> Xem bản đồ
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: LuLandmark, label: "Di tích", value: tongDiTich, color: "bg-teal-50 text-teal-700" },
                { icon: LuBookOpen, label: "Bài viết", value: tongBaiViet, color: "bg-amber-50 text-amber-700" },
                { icon: LuEye, label: "Lượt xem", value: (tongLuotXem._sum.luotXem || 0).toLocaleString("vi-VN"), color: "bg-blue-50 text-blue-700" },
                { icon: LuStar, label: "Danh mục", value: 8, color: "bg-emerald-50 text-emerald-700" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="glass-card p-5 flex flex-col gap-3">
                    <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800 font-heading">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* USP */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: LuSearch, title: "Tìm kiếm dễ dàng", desc: "Tra cứu di tích theo tên, danh mục, địa danh hoặc cấp di tích." },
              { icon: LuMap, title: "Bản đồ tương tác", desc: "Xem vị trí di tích trên bản đồ số với thông tin chi tiết." },
              { icon: LuStar, title: "Đánh giá & Yêu thích", desc: "Chia sẻ cảm nhận và lưu di tích yêu thích để theo dõi." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card p-7 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#191c1e] font-heading">{item.title}</h3>
                  <p className="text-sm text-[#3d4947] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] font-heading">Di tích nổi bật</h2>
              <p className="text-sm text-slate-500 mt-1">Những di tích được quan tâm nhiều nhất</p>
            </div>
            <Link href="/di-san-van-hoa" className="hidden md:inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-heading font-semibold">
              Xem tất cả <LuArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {noiBat.map((dt) => (
              <DiTichCard key={dt.id} diTich={dt} />
            ))}
          </div>
        </section>

        {/* News */}
        {tinTuc.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] font-heading">Tin tức mới nhất</h2>
                <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin về di tích và văn hóa</p>
              </div>
              <Link href="/tin-tuc" className="hidden md:inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-heading font-semibold">
                Xem tất cả <LuArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tinTuc.map((bv) => (
                <Link key={bv.id} href={`/tin-tuc/${(bv as any).slug || bv.id}`}>
                  <div className="glass-card overflow-hidden hover:shadow-ambient-teal-lg transition-all duration-300">
                    <div className="p-6 md:p-7 space-y-3">
                      <h3 className="text-lg font-bold text-[#191c1e] font-heading line-clamp-2">{bv.tieuDe}</h3>
                      <p className="text-sm text-[#3d4947] line-clamp-3 leading-relaxed">
                        {bv.noiDung.replace(/<[^>]*>/g, "").slice(0, 150)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-teal-600 font-heading font-semibold">
                        Đọc thêm <LuArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
