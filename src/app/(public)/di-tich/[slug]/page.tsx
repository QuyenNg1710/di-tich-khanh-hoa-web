import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageCarousel from "@/components/ditich/ImageCarousel";
import DescriptionSpeaker from "@/components/ditich/DescriptionSpeaker";
import FavoriteButton from "@/components/ditich/FavoriteButton";
import ReviewSection from "@/components/ditich/ReviewSection";
import MiniMapWrapper from "@/components/map/MiniMapWrapper";
import DirectionsMapWrapper from "@/components/map/DirectionsMapWrapper";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Eye, Building2, BookOpen, Star, Compass, Award } from "lucide-react";

function getVideoEmbedUrl(url: string) {
  try {
    if (url.startsWith("watch?")) {
      const params = new URLSearchParams(url.replace(/^watch\?/, ""));
      const videoId = params.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsedUrl.hostname.includes("drive.google.com")) {
      const match = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/);
      return match?.[1] ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
  } catch {}

  return url;
}

function isEmbedVideoUrl(url: string) {
  return /^watch\?/i.test(url) || /youtube\.com|youtu\.be|drive\.google\.com/i.test(url);
}

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
  const textToSpeechAudio = diTich.audios.find((audio) => audio.url.startsWith("tts://"));
  const audioFiles = diTich.audios.filter((audio) => !audio.url.startsWith("tts://"));
  const descriptionSpeechText = textToSpeechAudio?.moTa || diTich.moTa;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">

      {/* 2. Title & Stats Row (Header Section) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full border-0 text-white shadow-xs",
              diTich.capDiTich === "CAP_QUOC_GIA" 
                ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                : "bg-gradient-to-r from-teal-500 to-emerald-500"
            )}
          >
            {diTich.capDiTich === "CAP_QUOC_GIA" ? "Di tích cấp quốc gia" : "Di tích cấp tỉnh"}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-xs text-muted-foreground border-slate-200">
            {diTich.danhMuc.tenDanhMuc}
          </Badge>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
          {diTich.tenDiTich}
        </h1>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="size-4 fill-current mr-1" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(avgRating._avg.diemSo || 0).toFixed(1)}
              </span>
            </div>
            <span>({avgRating._count} đánh giá)</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-850 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <Eye className="size-4 text-slate-450" />
            <span><strong className="text-slate-800 dark:text-slate-200 font-medium">{diTich.luotXem.toLocaleString("vi-VN")}</strong> lượt xem</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-855 hidden sm:block" />

          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="size-4 text-rose-500 shrink-0" />
            <span className="truncate">{diTich.diaChi}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: Media, Details, Map, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-md">
            <ImageCarousel images={diTich.hinhAnhs} fallback={diTich.hinhAnhDaiDien || undefined} />
          </div>

          {/* Interactive Content Tabs */}
          <Tabs defaultValue="mota" className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
            <TabsList className="flex flex-wrap gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl w-fit">
              <TabsTrigger 
                value="mota" 
                className="px-4 py-2 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-xs transition-all cursor-pointer"
              >
                Giới thiệu
              </TabsTrigger>
              {diTich.videos.length > 0 && (
                <TabsTrigger 
                  value="video"
                  className="px-4 py-2 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-xs transition-all cursor-pointer"
                >
                  Thư viện Video
                </TabsTrigger>
              )}
              {audioFiles.length > 0 && (
                <TabsTrigger 
                  value="audio"
                  className="px-4 py-2 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-xs transition-all cursor-pointer"
                >
                  File Thuyết minh
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="bando"
                className="px-4 py-2 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-xs transition-all cursor-pointer"
              >
                Vị trí bản đồ
              </TabsTrigger>
              <TabsTrigger 
                value="chiduong"
                className="px-4 py-2 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-xs transition-all cursor-pointer"
              >
                Chỉ đường đi
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: Overview */}
            <TabsContent value="mota" className="mt-0 focus-visible:outline-none">
              <div className="prose dark:prose-invert max-w-none text-slate-655 dark:text-slate-300 leading-relaxed space-y-4">
                {diTich.moTaChiTiet ? (
                  <div className="space-y-4">
                    <div dangerouslySetInnerHTML={{ __html: diTich.moTaChiTiet }} />
                  </div>
                ) : (
                  <p className="text-slate-655 dark:text-slate-300">{diTich.moTa}</p>
                )}
              </div>
            </TabsContent>

            {/* TAB CONTENT: Video */}
            {diTich.videos.length > 0 && (
              <TabsContent value="video" className="mt-0 focus-visible:outline-none">
                <div className="grid gap-6">
                  {diTich.videos.map((v) => (
                    <div key={v.id} className="group overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 p-4 space-y-3">
                      {isEmbedVideoUrl(v.url) ? (
                        <div className="aspect-video w-full max-w-3xl rounded-lg overflow-hidden border border-slate-200/60 shadow-xs">
                          <iframe
                            src={getVideoEmbedUrl(v.url)}
                            title={v.moTa || "Video di tích"}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-2xl rounded-lg overflow-hidden border border-slate-200/60 bg-black">
                          <video controls className="w-full">
                            <source src={v.url} />
                          </video>
                        </div>
                      )}
                      {v.moTa && (
                        <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 bg-teal-500 rounded-full" />
                          {v.moTa}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* TAB CONTENT: Audio */}
            {audioFiles.length > 0 && (
              <TabsContent value="audio" className="mt-0 focus-visible:outline-none">
                <div className="grid gap-4">
                  {audioFiles.map((a) => (
                    <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                      <div className="p-2.5 rounded-lg bg-teal-55 dark:bg-teal-950 text-teal-600 dark:text-teal-400 self-start">
                        <span className="text-xl">🎵</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {a.moTa || "Audio thuyết minh"}
                        </p>
                        <audio controls className="w-full mt-2 h-10">
                          <source src={a.url} />
                          Trình duyệt của bạn không hỗ trợ phát audio.
                        </audio>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* TAB CONTENT: Map */}
            <TabsContent value="bando" className="mt-0 focus-visible:outline-none">
              <div className="h-[400px] md:h-[450px] rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner relative">
                <MiniMapWrapper lat={diTich.toaDoLat} lng={diTich.toaDoLng} name={diTich.tenDiTich} />
              </div>
            </TabsContent>

            {/* TAB CONTENT: Directions */}
            <TabsContent value="chiduong" className="mt-0 focus-visible:outline-none">
              <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xs">
                <DirectionsMapWrapper
                  destLat={diTich.toaDoLat}
                  destLng={diTich.toaDoLng}
                  destName={diTich.tenDiTich}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Reviews Area (Placed naturally underneath Left Column) */}
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
            <ReviewSection diTichId={diTich.id} />
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28">
          {/* Card 1: Key Metadata */}
          <Card className="glass-card shadow-ambient-teal border-slate-100 dark:border-slate-800/60 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="size-4 text-teal-600 dark:text-teal-400" />
                Thông tin di tích
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                {/* Category */}
                <div className="flex gap-3">
                  <span className="p-1.5 h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <BookOpen className="size-4" />
                  </span>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Danh mục</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{diTich.danhMuc.tenDanhMuc}</span>
                  </div>
                </div>

                {/* Level classification */}
                <div className="flex gap-3">
                  <span className="p-1.5 h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Award className="size-4" />
                  </span>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Cấp xếp hạng</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {diTich.capDiTich === "CAP_QUOC_GIA" ? "Cấp Quốc Gia" : "Cấp Tỉnh"}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-3">
                  <span className="p-1.5 h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Địa chỉ</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug line-clamp-2" title={diTich.diaChi}>
                      {diTich.diaChi}
                    </span>
                  </div>
                </div>

                {/* Management agency */}
                {(diTich.donViQuanLyInfo?.tenDonVi || diTich.donViQuanLy) && (
                  <div className="flex gap-3">
                    <span className="p-1.5 h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Building2 className="size-4" />
                    </span>
                    <div>
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Đơn vị quản lý</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {diTich.donViQuanLyInfo?.tenDonVi || diTich.donViQuanLy}
                      </span>
                    </div>
                  </div>
                )}

                {/* Views */}
                <div className="flex gap-3">
                  <span className="p-1.5 h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                    <Eye className="size-4" />
                  </span>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Lượt xem</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {diTich.luotXem.toLocaleString("vi-VN")} lượt xem
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Interactive Actions & Audio Guide */}
          <Card className="glass-card shadow-ambient-teal border-slate-100 dark:border-slate-800/60 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Compass className="size-4 text-teal-600 dark:text-teal-400" />
                Tiện ích & Trải nghiệm
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {/* Premium Audio Guide integration */}
              <DescriptionSpeaker text={descriptionSpeechText} variant="widget" />

              {/* Actions Section */}
              <div className="flex gap-3 pt-1">
                <div className="flex-1 *:[button]:w-full *:[button]:justify-center *:[button]:h-10 *:[button]:rounded-xl *:[button]:cursor-pointer">
                  <FavoriteButton diTichId={diTich.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
