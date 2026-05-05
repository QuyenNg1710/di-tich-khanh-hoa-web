import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function TinTucDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const isNumeric = /^\d+$/.test(slug);
  const baiViet = await prisma.baiViet.findUnique({
    where: isNumeric ? { id: Number(slug) } : { slug },
    include: { tacGia: { select: { fullName: true, avatarUrl: true } } },
  });

  if (!baiViet) notFound();

  const related = await prisma.baiViet.findMany({
    where: { trangThai: true, id: { not: baiViet.id } },
    select: { id: true, slug: true, tieuDe: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Badge variant="secondary" className="mb-4">Tin tức</Badge>
      <h1 className="text-3xl font-bold mb-4">{baiViet.tieuDe}</h1>

      <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {baiViet.tacGia.fullName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span>{baiViet.tacGia.fullName}</span>
        <span>•</span>
        <span>{format(baiViet.createdAt, "dd/MM/yyyy", { locale: vi })}</span>
      </div>

      {baiViet.hinhAnh && (
        <img src={baiViet.hinhAnh} alt={baiViet.tieuDe} className="w-full rounded-lg mb-6" />
      )}

      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: baiViet.noiDung }} />

      {related.length > 0 && (
        <>
          <Separator className="my-8" />
          <h2 className="text-xl font-bold mb-4">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((bv) => (
              <Link key={bv.id} href={`/tin-tuc/${bv.slug}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2">{bv.tieuDe}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(bv.createdAt, "dd/MM/yyyy", { locale: vi })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
