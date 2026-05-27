import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ImageCarousel from "@/components/ditich/ImageCarousel";
import FavoriteButton from "@/components/ditich/FavoriteButton";
import ReviewSection from "@/components/ditich/ReviewSection";
import { HiEye, HiLocationMarker, HiOfficeBuilding } from "react-icons/hi";
import MiniMapWrapper from "@/components/map/MiniMapWrapper";
import DirectionsMapWrapper from "@/components/map/DirectionsMapWrapper";

export default async function DiTichDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const isNumeric = /^\d+$/.test(slug);
  const diTich = await prisma.diTich.findUnique({
    where: isNumeric ? { id: Number(slug) } : { slug },
    include: {
      danhMuc: true,
      donViQuanLyInfo: true,
      hinhAnhs: { orderBy: { thuTu: "asc" } },
      videos: { orderBy: { thuTu: "asc" } },
      audios: { orderBy: { thuTu: "asc" } },
    },
  });

  if (!diTich) notFound();

  await prisma.diTich.update({
    where: { id: diTich.id },
    data: { luotXem: { increment: 1 } },
  });

  const avgRating = await prisma.danhGia.aggregate({
    where: { diTichId: diTich.id, trangThai: true },
    _avg: { diemSo: true },
    _count: true,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Image */}
        <div className="lg:col-span-3">
          <ImageCarousel images={diTich.hinhAnhs} fallback={diTich.hinhAnhDaiDien || undefined} />
        </div>

        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Badge variant={diTich.capDiTich === "CAP_QUOC_GIA" ? "default" : "secondary"}>
              {diTich.capDiTich === "CAP_QUOC_GIA" ? "Di tích cấp quốc gia" : "Di tích cấp tỉnh"}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">{diTich.tenDiTich}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              {"⭐".repeat(Math.round(avgRating._avg.diemSo || 0))}
              {" "}{(avgRating._avg.diemSo || 0).toFixed(1)} ({avgRating._count} đánh giá)
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <HiLocationMarker className="text-muted-foreground shrink-0" />
              {diTich.diaChi}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">📂</span>
              {diTich.danhMuc.tenDanhMuc}
            </p>
            {(diTich.donViQuanLyInfo?.tenDonVi || diTich.donViQuanLy) && (
              <p className="flex items-center gap-2">
                <HiOfficeBuilding className="text-muted-foreground shrink-0" />
                {diTich.donViQuanLyInfo?.tenDonVi || diTich.donViQuanLy}
              </p>
            )}
            <p className="flex items-center gap-2">
              <HiEye className="text-muted-foreground" />
              {diTich.luotXem.toLocaleString("vi-VN")} lượt xem
            </p>
          </div>

          <FavoriteButton diTichId={diTich.id} />

          <p className="text-muted-foreground">{diTich.moTa}</p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Tabs */}
      <Tabs defaultValue="mota" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mota">Mô tả</TabsTrigger>
          {diTich.videos.length > 0 && <TabsTrigger value="video">Video</TabsTrigger>}
          {diTich.audios.length > 0 && <TabsTrigger value="audio">Audio</TabsTrigger>}
          <TabsTrigger value="bando">Bản đồ</TabsTrigger>
          <TabsTrigger value="chiduong">Chỉ đường</TabsTrigger>
        </TabsList>

        <TabsContent value="mota">
          <div className="prose max-w-none">
            {diTich.moTaChiTiet ? (
              <div dangerouslySetInnerHTML={{ __html: diTich.moTaChiTiet }} />
            ) : (
              <p className="text-muted-foreground">{diTich.moTa}</p>
            )}
          </div>
        </TabsContent>

        {diTich.videos.length > 0 && (
          <TabsContent value="video">
            <div className="grid gap-4">
              {diTich.videos.map((v) => (
                <div key={v.id}>
                  <video controls className="w-full max-w-2xl rounded-lg">
                    <source src={v.url} />
                  </video>
                  {v.moTa && <p className="text-sm text-muted-foreground mt-2">{v.moTa}</p>}
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        {diTich.audios.length > 0 && (
          <TabsContent value="audio">
            <div className="space-y-4">
              {diTich.audios.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <span className="text-2xl">🎵</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.moTa || "Audio thuyết minh"}</p>
                    <audio controls className="w-full mt-2">
                      <source src={a.url} />
                    </audio>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="bando">
          <div className="h-[400px] rounded-lg overflow-hidden border">
            <MiniMapWrapper lat={diTich.toaDoLat} lng={diTich.toaDoLng} name={diTich.tenDiTich} />
          </div>
        </TabsContent>

        <TabsContent value="chiduong">
          <DirectionsMapWrapper
            destLat={diTich.toaDoLat}
            destLng={diTich.toaDoLng}
            destName={diTich.tenDiTich}
          />
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      {/* Reviews */}
      <ReviewSection diTichId={diTich.id} />
    </div>
  );
}
