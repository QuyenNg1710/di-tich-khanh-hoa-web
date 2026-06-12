import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeHeroSlider from "@/components/home/HomeHeroSlider";
import HomeMapPreview from "@/components/map/HomeMapPreview";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  LuArrowRight,
  LuBookOpen,
  LuEye,
  LuLandmark,
  LuMapPin,
  LuSearch,
  LuStar,
} from "react-icons/lu";

export const dynamic = "force-dynamic";

const diaDanh = [
  { name: "Nha Trang", aliases: ["Nha Trang", "TP. Nha Trang", "Thành phố Nha Trang"], count: 40 },
  { name: "Cam Ranh", aliases: ["Cam Ranh", "TP. Cam Ranh", "Thành phố Cam Ranh"], count: 5 },
  { name: "Ninh Hòa", aliases: ["Ninh Hòa", "TX. Ninh Hòa", "Thị xã Ninh Hòa", "Ninh Hoà"], count: 35 },
  { name: "Diên Khánh", aliases: ["Diên Khánh", "Diên Khanh"], count: 19 },
  { name: "Cam Lâm", aliases: ["Cam Lâm", "Cam Lam"], count: 5 },
  { name: "Khánh Vĩnh", aliases: ["Khánh Vĩnh", "Khanh Vinh"], count: 2 },
  { name: "Khánh Sơn", aliases: ["Khánh Sơn", "Khanh Son"], count: 3 },
  { name: "Vạn Ninh", aliases: ["Vạn Ninh", "Van Ninh"], count: 6 },
  { name: "Trường Sa", aliases: ["Trường Sa", "Truong Sa"], count:1 },
];

const homeHeroSlides = [
  { sourceName: "Tháp Bà Ponagar", title: "Tháp Bà Ponagar Nha Trang" },
  { sourceName: "Hòn Chồng - Hòn Đỏ", title: "Danh Thắng Hòn Chồng - Hòn Đỏ" },
  { sourceName: "Am Chúa", title: "Di tích lịch sử Am Chúa" },
];

export default async function HomePage() {
  const [heroItems, quocGia, gridItems, tongDiTich, tongBaiViet, danhMucs, mapItems] = await Promise.all([
    prisma.diTich.findMany({
      where: {
        trangThai: true,
        tenDiTich: { in: homeHeroSlides.map((slide) => slide.sourceName) },
      },
      include: { hinhAnhs: { take: 1, orderBy: { thuTu: "asc" } } },
    }),
    prisma.diTich.findMany({
      where: { trangThai: true, capDiTich: "CAP_QUOC_GIA" },
      orderBy: { luotXem: "desc" },
      take: 12,
      include: { danhMuc: true, hinhAnhs: { take: 1, orderBy: { thuTu: "asc" } } },
    }),
    prisma.diTich.findMany({
      where: { trangThai: true },
      orderBy: [{ capDiTich: "asc" }, { luotXem: "desc" }],
      take: 8,
      include: { danhMuc: true, hinhAnhs: { take: 1, orderBy: { thuTu: "asc" } } },
    }),
    prisma.diTich.count({ where: { trangThai: true } }),
    prisma.baiViet.count({ where: { trangThai: true } }),
    prisma.danhMuc.findMany({
      where: {
        tenDanhMuc: {
          notIn: ["Tháp", "Chùa", "Đình", "Thành cổ", "Nhà thờ", "Miếu", "Đền"],
        },
      },
      orderBy: { tenDanhMuc: "asc" },
    }),
    prisma.diTich.findMany({
      where: { trangThai: true },
      take: 80,
      select: {
        id: true,
        tenDiTich: true,
        diaChi: true,
        toaDoLat: true,
        toaDoLng: true,
        capDiTich: true,
        hinhAnhDaiDien: true,
        hinhAnhs: { select: { url: true }, orderBy: { thuTu: "asc" }, take: 1 },
        danhMuc: { select: { tenDanhMuc: true } },
      },
    }),
  ]);

  const tongLuotXem = await prisma.diTich.aggregate({
    where: { trangThai: true },
    _sum: { luotXem: true },
  });

  const heroSlides = homeHeroSlides
    .map((slide) => {
      const item = heroItems.find((heroItem) => heroItem.tenDiTich === slide.sourceName);

      if (!item) return null;

      return {
        id: item.id,
        title: slide.title,
        imageUrl: item.hinhAnhs?.[0]?.url || item.hinhAnhDaiDien,
      };
    })
    .filter((slide): slide is NonNullable<typeof slide> => Boolean(slide));
  const displayGridItems = gridItems.length > 0 ? gridItems : quocGia;

  const mapData = mapItems.map((item) => ({
    id: item.id,
    tenDiTich: item.tenDiTich,
    diaChi: item.diaChi,
    toaDoLat: item.toaDoLat,
    toaDoLng: item.toaDoLng,
    capDiTich: item.capDiTich,
    hinhAnhDaiDien: item.hinhAnhs[0]?.url || item.hinhAnhDaiDien,
    tenDanhMuc: item.danhMuc.tenDanhMuc,
  }));

  const diaDanhCounts = diaDanh.map((location) => ({
    name: location.name,
    count:
      location.count ??
      mapItems.filter((item) => {
        const address = item.diaChi.toLowerCase();
        return location.aliases.some((alias) => address.includes(alias.toLowerCase()));
      }).length,
  }));

  return (
    <>
      <Header />
      <main className="flex-1 bg-white pt-20 pb-16">
        <section className="relative">
          <HomeHeroSlider slides={heroSlides} />

          <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-6">
            <form
              action="/tim-kiem"
              className="flex flex-col gap-3 rounded-sm border border-slate-200 bg-white p-4 shadow-lg md:flex-row md:items-center"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 md:w-36">
                <LuSearch className="h-4 w-4 text-teal-700" />
                Tìm kiếm di tích
              </div>
              <input
                name="q"
                placeholder="Nhập từ khóa..."
                className="h-10 flex-1 rounded border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-teal-600"
              />
              <select
                name="danhMucId"
                defaultValue="all"
                className="h-10 rounded border border-slate-200 px-3 text-sm text-slate-600 outline-none transition-colors focus:border-teal-600 md:w-44"
              >
                <option value="all">Danh mục</option>
                {danhMucs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tenDanhMuc}
                  </option>
                ))}
              </select>
              <select
                name="khuVuc"
                defaultValue="all"
                className="h-10 rounded border border-slate-200 px-3 text-sm text-slate-600 outline-none transition-colors focus:border-teal-600 md:w-44"
              >
                <option value="all">Khu vực</option>
                {diaDanh.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-10 rounded bg-amber-500 px-7 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: LuLandmark, label: "Di tích", value: tongDiTich },
              { icon: LuBookOpen, label: "Bài viết", value: tongBaiViet },
              { icon: LuEye, label: "Lượt xem", value: (tongLuotXem._sum.luotXem || 0).toLocaleString("vi-VN") },
              { icon: LuStar, label: "Danh mục", value: danhMucs.length },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded border border-slate-200 bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900 font-heading">{item.value}</p>
                    <p className="text-xs uppercase text-slate-500">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-7xl px-6">
          <h2 className="mb-6 text-center text-2xl font-semibold uppercase text-orange-600 font-heading">
            Di tích nổi bật
          </h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {displayGridItems.map((item) => {
              const imageUrl = item.hinhAnhs?.[0]?.url || item.hinhAnhDaiDien;
              return (
                <Link key={item.id} href={`/di-tich/${item.slug || item.id}`} className="group block">
                  <div className="overflow-hidden rounded bg-slate-100">
                    {imageUrl ? (
                      <div
                        role="img"
                        aria-label={item.tenDiTich}
                        className="aspect-[4/2.7] bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      />
                    ) : (
                      <div className="flex aspect-[4/2.7] items-center justify-center bg-teal-50 text-teal-700">
                        <LuLandmark className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium uppercase text-slate-700 transition-colors group-hover:text-teal-700">
                    {item.tenDiTich}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="/di-san-van-hoa" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
              Xem tất cả <LuArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <div className="h-[360px] border-y border-slate-200">
            <HomeMapPreview items={mapData} />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8">
            <h2 className="mb-6 text-center text-2xl font-semibold uppercase text-orange-600 font-heading">
              Di tích theo địa danh
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {diaDanhCounts.map((item) => (
                <Link
                  key={item.name}
                  href={`/tim-kiem?khuVuc=${encodeURIComponent(item.name)}`}
                  className="flex items-center gap-4 rounded border border-slate-200 bg-white p-4 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-teal-50 text-teal-700">
                    <LuMapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.count} di tích</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
