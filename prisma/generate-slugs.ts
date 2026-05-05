import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateSlug(text: string): string {
  const map: Record<string, string> = {
    à:"a",á:"a",ả:"a",ã:"a",ạ:"a",ă:"a",ằ:"a",ắ:"a",ẳ:"a",ẵ:"a",ặ:"a",
    â:"a",ầ:"a",ấ:"a",ẩ:"a",ẫ:"a",ậ:"a",è:"e",é:"e",ẻ:"e",ẽ:"e",ẹ:"e",
    ê:"e",ề:"e",ế:"e",ể:"e",ễ:"e",ệ:"e",ì:"i",í:"i",ỉ:"i",ĩ:"i",ị:"i",
    ò:"o",ó:"o",ỏ:"o",õ:"o",ọ:"o",ô:"o",ồ:"o",ố:"o",ổ:"o",ỗ:"o",ộ:"o",
    ơ:"o",ờ:"o",ớ:"o",ở:"o",ỡ:"o",ợ:"o",ù:"u",ú:"u",ủ:"u",ũ:"u",ụ:"u",
    ư:"u",ừ:"u",ứ:"u",ử:"u",ữ:"u",ự:"u",ỳ:"y",ý:"y",ỷ:"y",ỹ:"y",ỵ:"y",
    đ:"d",
  };
  return text.toLowerCase().split("").map((c) => map[c] || c).join("")
    .replace(/[^a-z0-9\s-]/g, "").replace(/[\s]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  // Generate slugs for di_tich
  const diTichs = await prisma.diTich.findMany({ where: { slug: null } });
  for (const dt of diTichs) {
    let slug = generateSlug(dt.tenDiTich);
    const existing = await prisma.diTich.findUnique({ where: { slug } });
    if (existing && existing.id !== dt.id) slug = `${slug}-${dt.id}`;
    await prisma.diTich.update({ where: { id: dt.id }, data: { slug } });
    console.log(`DiTich: ${dt.tenDiTich} → ${slug}`);
  }

  // Generate slugs for bai_viet
  const baiViets = await prisma.baiViet.findMany({ where: { slug: null } });
  for (const bv of baiViets) {
    let slug = generateSlug(bv.tieuDe);
    const existing = await prisma.baiViet.findUnique({ where: { slug } });
    if (existing && existing.id !== bv.id) slug = `${slug}-${bv.id}`;
    await prisma.baiViet.update({ where: { id: bv.id }, data: { slug } });
    console.log(`BaiViet: ${bv.tieuDe} → ${slug}`);
  }

  console.log("Done!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
