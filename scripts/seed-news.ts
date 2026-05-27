import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const articleImages = {
  thapBaPonagar: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779847317521-zraf6colue.jpeg",
  thanhCoDienKhanh: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779847707882-9tgvhnepnsk.jpg",
  chuaLongSon: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779847751679-js5e7w3tqvj.jpg",
  honChongHonVo: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779847728019-ylrc4frj6m.jpg",
  nhaThoNui: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779847809907-bufjr3ci1n.jpg",
  amChua: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779848802558-ruffiywtmwp.jpg",
  mieuTranQuyCap: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779849267904-pp4kt03fotj.jpg",
  dinhPhuCang: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779849285177-ikse3v2pdud.gif",
  dinhPhuocHai: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1779849232681-o2fpia2w3wn.jpg",
  dinhVinhDiem: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1778381149290-fetesdbiooc.jpg",
  dinhVanThanh: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1778381672799-1hj2cict0vl.jpg",
  dinhBinhTan: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1778382233612-pwqu040f6fq.jpg",
  dinhThuyTu: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1778382580877-r0ctuvysvpa.jpg",
  dinhLuCam: "https://qtzgudtcduwfvpkjhule.supabase.co/storage/v1/object/public/images/1778382955299-4n5unplacvt.jpg",
};

const posts = [
  {
    tieuDe: "Tháp Bà Ponagar - Biểu tượng văn hóa Chăm Pa tại Nha Trang",
    noiDung:
      "<p>Tháp Bà Ponagar là một trong những quần thể di tích kiến trúc Chăm Pa tiêu biểu nhất còn tồn tại tại Việt Nam. Nằm trên đỉnh đồi Cù Lao, bên cạnh cửa sông Cái, quần thể tháp này không chỉ là di tích lịch sử mà còn là nơi sinh hoạt tín ngưỡng quan trọng của người dân Khánh Hòa.</p><p>Hàng năm, lễ hội Tháp Bà Ponagar thu hút đông đảo người dân và du khách đến tham quan, dâng hương và tìm hiểu giá trị văn hóa Chăm Pa.</p>",
    hinhAnh: articleImages.thapBaPonagar,
    createdAt: new Date("2026-05-20T08:00:00.000Z"),
  },
  {
    tieuDe: "Khám phá Thành cổ Diên Khánh - Dấu ấn lịch sử nhà Nguyễn",
    noiDung:
      "<p>Thành cổ Diên Khánh được xây dựng năm 1793 dưới thời chúa Nguyễn Ánh, là một công trình quân sự quan trọng trong lịch sử Việt Nam. Thành có hình lục giác không đều với chu vi gần 2.700m.</p><p>Mặc dù đã trải qua hơn 200 năm, nhiều đoạn tường thành và cổng thành vẫn còn nguyên vẹn, minh chứng cho một thời kỳ lịch sử đầy biến động.</p>",
    hinhAnh: articleImages.thanhCoDienKhanh,
    createdAt: new Date("2026-05-16T08:00:00.000Z"),
  },
  {
    tieuDe: "Chùa Long Sơn và tượng Phật Trắng - Biểu tượng tâm linh Nha Trang",
    noiDung:
      "<p>Tọa lạc trên đường 23/10, Chùa Long Sơn là ngôi chùa lớn và nổi tiếng nhất thành phố Nha Trang. Điểm nhấn của chùa là bức tượng Phật Thích Ca Mâu Ni màu trắng cao 24m trên đỉnh đồi Trại Thủy.</p><p>Chùa không chỉ là nơi tu hành mà còn là điểm tham quan văn hóa thu hút đông đảo du khách khi đến Khánh Hòa.</p>",
    hinhAnh: articleImages.chuaLongSon,
    createdAt: new Date("2026-05-12T08:00:00.000Z"),
  },
  {
    tieuDe: "Hòn Chồng - Hòn Vợ: Điểm nhấn danh thắng ven biển Nha Trang",
    noiDung:
      "<p>Hòn Chồng - Hòn Vợ là danh thắng nổi bật của thành phố Nha Trang, gây ấn tượng bởi những khối đá tự nhiên xếp chồng lên nhau bên bờ biển. Không gian nơi đây kết hợp giữa cảnh quan biển, núi và các câu chuyện dân gian giàu màu sắc.</p><p>Trong định hướng phát huy giá trị di sản, khu vực Hòn Chồng tiếp tục là điểm đến quan trọng phục vụ tham quan, học tập và quảng bá hình ảnh văn hóa biển đảo Khánh Hòa.</p>",
    hinhAnh: articleImages.honChongHonVo,
    createdAt: new Date("2026-05-08T08:00:00.000Z"),
  },
  {
    tieuDe: "Am Chúa và tín ngưỡng thờ Thiên Y A Na tại Khánh Hòa",
    noiDung:
      "<p>Am Chúa là di tích gắn với tín ngưỡng thờ Thiên Y A Na, một lớp văn hóa dân gian có vị trí đặc biệt trong đời sống tinh thần của người dân Khánh Hòa. Không gian di tích nằm giữa cảnh quan núi đồi yên tĩnh, tạo nên nét trang nghiêm và gần gũi.</p><p>Việc gìn giữ, giới thiệu giá trị Am Chúa góp phần giúp cộng đồng hiểu sâu hơn về tín ngưỡng bản địa, truyền thống tri ân tiền nhân và sự giao thoa văn hóa trên vùng đất Khánh Hòa.</p>",
    hinhAnh: articleImages.amChua,
    createdAt: new Date("2026-05-03T08:00:00.000Z"),
  },
  {
    tieuDe: "Nhà thờ Núi Nha Trang - Dấu ấn kiến trúc Gothic giữa lòng phố biển",
    noiDung:
      "<p>Nhà thờ Núi, còn gọi là Nhà thờ Đá, là công trình kiến trúc quen thuộc tại trung tâm thành phố Nha Trang. Với tháp chuông cao, các vòm cửa nhọn và chất liệu đá đặc trưng, công trình mang vẻ đẹp cổ kính giữa nhịp sống hiện đại.</p><p>Không chỉ là nơi sinh hoạt tôn giáo, Nhà thờ Núi còn là địa điểm tham quan được nhiều du khách lựa chọn khi tìm hiểu lịch sử đô thị và kiến trúc tại Khánh Hòa.</p>",
    hinhAnh: articleImages.nhaThoNui,
    createdAt: new Date("2026-04-28T08:00:00.000Z"),
  },
  {
    tieuDe: "Đình Phú Cang - Không gian văn hóa làng cổ tại Ninh Hòa",
    noiDung:
      "<p>Đình Phú Cang là một trong những di tích tiêu biểu phản ánh đời sống văn hóa làng xã tại thị xã Ninh Hòa. Công trình lưu giữ dấu ấn kiến trúc đình làng truyền thống cùng các sinh hoạt tín ngưỡng gắn bó với cộng đồng địa phương.</p><p>Các hoạt động bảo tồn và phát huy giá trị đình làng giúp thế hệ trẻ hiểu thêm về lịch sử khai khẩn, truyền thống uống nước nhớ nguồn và bản sắc văn hóa của vùng đất Ninh Hòa.</p>",
    hinhAnh: articleImages.dinhPhuCang,
    createdAt: new Date("2026-04-23T08:00:00.000Z"),
  },
  {
    tieuDe: "Miếu Trần Quý Cáp - Ghi nhớ tinh thần yêu nước đầu thế kỷ XX",
    noiDung:
      "<p>Miếu Trần Quý Cáp là địa chỉ tưởng niệm nhà chí sĩ yêu nước trong phong trào Duy Tân đầu thế kỷ XX. Di tích góp phần nhắc nhớ về truyền thống hiếu học, tinh thần canh tân và lòng yêu nước của các bậc tiền nhân.</p><p>Thông qua việc giới thiệu di tích, công tác giáo dục truyền thống lịch sử tại địa phương có thêm tư liệu gần gũi, giúp người dân và du khách nhận diện rõ hơn những dấu mốc văn hóa - lịch sử của Khánh Hòa.</p>",
    hinhAnh: articleImages.mieuTranQuyCap,
    createdAt: new Date("2026-04-18T08:00:00.000Z"),
  },
  {
    tieuDe: "Đình Phước Hải và nét sinh hoạt tín ngưỡng cộng đồng ở Nha Trang",
    noiDung:
      "<p>Đình Phước Hải là ngôi đình gắn với đời sống văn hóa, tín ngưỡng của cư dân Nha Trang. Không gian đình lưu giữ nhiều giá trị về kiến trúc, phong tục và ký ức cộng đồng qua các kỳ lễ hội truyền thống.</p><p>Việc bảo tồn các đình làng như Đình Phước Hải góp phần làm phong phú bản đồ di sản văn hóa đô thị, đồng thời tạo thêm điểm đến để người dân tìm hiểu lịch sử địa phương.</p>",
    hinhAnh: articleImages.dinhPhuocHai,
    createdAt: new Date("2026-04-12T08:00:00.000Z"),
  },
  {
    tieuDe: "Đình Vĩnh Điềm - Dấu ấn văn hóa làng xã ở Khánh Hòa",
    noiDung:
      "<p>Đình Vĩnh Điềm là một không gian văn hóa cộng đồng tiêu biểu, gắn với quá trình hình thành và phát triển của cư dân địa phương. Kiến trúc đình cùng các nghi lễ truyền thống phản ánh đời sống tinh thần phong phú của làng xã Khánh Hòa.</p><p>Việc giới thiệu Đình Vĩnh Điềm trên hệ thống di sản giúp người xem có thêm góc nhìn về các thiết chế văn hóa dân gian đang được gìn giữ trong đời sống hôm nay.</p>",
    hinhAnh: articleImages.dinhVinhDiem,
    createdAt: new Date("2026-04-06T08:00:00.000Z"),
  },
  {
    tieuDe: "Đình Vạn Thạnh và ký ức cộng đồng vùng biển Nha Trang",
    noiDung:
      "<p>Đình Vạn Thạnh là nơi lưu giữ nhiều giá trị văn hóa gắn với cư dân vùng biển. Không gian đình không chỉ phục vụ sinh hoạt tín ngưỡng mà còn là điểm tựa tinh thần của cộng đồng qua nhiều thế hệ.</p><p>Các hoạt động bảo tồn di tích góp phần gìn giữ ký ức làng biển, đồng thời tạo điều kiện để người dân và du khách hiểu thêm về nếp sống văn hóa ven biển Khánh Hòa.</p>",
    hinhAnh: articleImages.dinhVanThanh,
    createdAt: new Date("2026-03-30T08:00:00.000Z"),
  },
  {
    tieuDe: "Đình Bình Tân - Nơi lưu giữ nếp xưa trong lòng đô thị",
    noiDung:
      "<p>Đình Bình Tân là một trong những di tích phản ánh quá trình cư trú, khai khẩn và xây dựng cộng đồng tại khu vực Nha Trang. Trong nhịp phát triển đô thị, đình vẫn giữ vai trò quan trọng trong đời sống văn hóa địa phương.</p><p>Không gian di tích là nơi diễn ra các nghi lễ truyền thống, góp phần duy trì bản sắc và sự gắn kết của cư dân qua nhiều thế hệ.</p>",
    hinhAnh: articleImages.dinhBinhTan,
    createdAt: new Date("2026-03-24T08:00:00.000Z"),
  },
  {
    tieuDe: "Đình Thủy Tú - Giá trị kiến trúc và tín ngưỡng truyền thống",
    noiDung:
      "<p>Đình Thủy Tú mang trong mình nhiều giá trị về kiến trúc, lịch sử và tín ngưỡng dân gian. Những đường nét trang trí, không gian thờ tự và sinh hoạt lễ hội tạo nên bản sắc riêng của di tích.</p><p>Việc bảo tồn Đình Thủy Tú góp phần làm giàu thêm hệ thống di sản văn hóa cơ sở, giúp công chúng tiếp cận gần hơn với những giá trị truyền thống tại Khánh Hòa.</p>",
    hinhAnh: articleImages.dinhThuyTu,
    createdAt: new Date("2026-03-18T08:00:00.000Z"),
  },
  {
    tieuDe: "Đình Lư Cấm - Điểm tựa văn hóa của cư dân địa phương",
    noiDung:
      "<p>Đình Lư Cấm là một địa chỉ văn hóa quen thuộc, gắn với tín ngưỡng thờ Thành Hoàng và các bậc tiền hiền. Di tích góp phần phản ánh lịch sử cộng đồng, phong tục và truyền thống uống nước nhớ nguồn.</p><p>Thông qua công tác số hóa và giới thiệu trên website, các giá trị của Đình Lư Cấm có thể tiếp cận rộng hơn đến học sinh, người dân và du khách quan tâm đến di sản Khánh Hòa.</p>",
    hinhAnh: articleImages.dinhLuCam,
    createdAt: new Date("2026-03-10T08:00:00.000Z"),
  },
];

async function main() {
  const admin = await prisma.profile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000000" },
    update: { role: "ADMIN", fullName: "Admin", trangThai: true },
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      email: "admin@ditichkhanhhoa.vn",
      fullName: "Admin",
      role: "ADMIN",
    },
  });

  for (const post of posts) {
    const slug = generateSlug(post.tieuDe);
    await prisma.baiViet.upsert({
      where: { slug },
      update: { ...post, tacGiaId: admin.id, trangThai: true },
      create: { ...post, slug, tacGiaId: admin.id, trangThai: true },
    });
  }

  const latest = await prisma.baiViet.findMany({
    where: { trangThai: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { tieuDe: true, hinhAnh: true, createdAt: true },
  });

  console.log(
    JSON.stringify(
      latest.map((item) => ({
        title: item.tieuDe,
        hasImage: Boolean(item.hinhAnh),
        date: item.createdAt.toISOString().slice(0, 10),
      })),
      null,
      2,
    ),
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
