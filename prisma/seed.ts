import { PrismaClient, CapDiTich } from "@prisma/client";

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
  // Seed admin profile
  const adminProfile = await prisma.profile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000000" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      email: "admin@ditichkhanhhoa.vn",
      fullName: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`Seeded admin profile: ${adminProfile.fullName}`);

  // Seed danh mục
  const danhMucs = await prisma.$transaction([
    prisma.danhMuc.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        tenDanhMuc: "Tháp",
        moTa: "Tháp cổ, tháp Chăm",
        thuTu: 1,
      },
    }),
    prisma.danhMuc.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        tenDanhMuc: "Chùa",
        moTa: "Chùa, thiền viện",
        thuTu: 2,
      },
    }),
    prisma.danhMuc.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        tenDanhMuc: "Đình",
        moTa: "Đình làng, đình thờ",
        thuTu: 3,
      },
    }),
    prisma.danhMuc.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        tenDanhMuc: "Thành cổ",
        moTa: "Thành trì, di tích quân sự",
        thuTu: 4,
      },
    }),
    prisma.danhMuc.upsert({
      where: { id: 5 },
      update: {},
      create: {
        id: 5,
        tenDanhMuc: "Nhà thờ",
        moTa: "Nhà thờ, thánh đường",
        thuTu: 5,
      },
    }),
    prisma.danhMuc.upsert({
      where: { id: 6 },
      update: {},
      create: {
        id: 6,
        tenDanhMuc: "Danh lam thắng cảnh",
        moTa: "Danh lam, thắng cảnh thiên nhiên",
        thuTu: 6,
      },
    }),
    prisma.danhMuc.upsert({
      where: { id: 7 },
      update: {},
      create: {
        id: 7,
        tenDanhMuc: "Miếu",
        moTa: "Miếu thờ, đền thờ",
        thuTu: 7,
      },
    }),
    prisma.danhMuc.upsert({
      where: { id: 8 },
      update: { thuTu: 9 },
      create: {
        id: 8,
        tenDanhMuc: "Di tích lịch sử",
        moTa: "Di tích lịch sử, cách mạng",
        thuTu: 9,
      },
    }),
    prisma.danhMuc.upsert({
      where: { id: 9 },
      update: {},
      create: {
        id: 9,
        tenDanhMuc: "Đền",
        moTa: "Đền thờ, nơi thờ tự",
        thuTu: 8,
      },
    }),
  ]);

  console.log(`Seeded ${danhMucs.length} danh mục`);

  // Seed di tích thực tế tỉnh Khánh Hòa
  const diTichs = [
    {
      tenDiTich: "Tháp Bà Ponagar",
      moTa: "Tháp Bà Ponagar là quần thể di tích kiến trúc Chăm Pa tiêu biểu, nằm trên đỉnh đồi Cù Lao, bên cạnh cửa sông Cái, thành phố Nha Trang.",
      moTaChiTiet:
        "Tháp Bà Ponagar được xây dựng từ thế kỷ VII đến thế kỷ XII, thờ nữ thần Ponagar (Thiên Y Thánh Mẫu). Quần thể gồm 4 tháp chính, trong đó tháp lớn nhất cao 23m. Đây là một trong những công trình kiến trúc Chăm Pa còn nguyên vẹn nhất tại Việt Nam, được công nhận là Di tích quốc gia đặc biệt. Hàng năm, lễ hội Tháp Bà được tổ chức vào tháng 3 âm lịch, thu hút hàng ngàn du khách.",
      diaChi: "2 Tháng 4, Vĩnh Phước, Nha Trang, Khánh Hòa",
      toaDoLat: 12.2654,
      toaDoLng: 109.195,
      danhMucId: 1,
      capDiTich: CapDiTich.CAP_QUOC_GIA,
      luotXem: 2345,
    },
    {
      tenDiTich: "Thành cổ Diên Khánh",
      moTa: "Thành cổ Diên Khánh là một thành trì quân sự được xây dựng dưới thời nhà Nguyễn vào năm 1793, nằm tại thị trấn Diên Khánh.",
      moTaChiTiet:
        "Thành có hình lục giác không đều, chu vi khoảng 2.693m, cao 3,5m, có hào nước bao quanh. Thành được xây bằng đá ong và đất nện. Hiện còn giữ lại cổng thành phía Đông và một số đoạn tường thành. Thành cổ Diên Khánh là di tích lịch sử quan trọng, minh chứng cho thời kỳ nội chiến Tây Sơn - Nguyễn Ánh.",
      diaChi: "Thị trấn Diên Khánh, huyện Diên Khánh, Khánh Hòa",
      toaDoLat: 12.2586,
      toaDoLng: 109.1003,
      danhMucId: 4,
      capDiTich: CapDiTich.CAP_QUOC_GIA,
      luotXem: 1567,
    },
    {
      tenDiTich: "Chùa Long Sơn",
      moTa: "Chùa Long Sơn (còn gọi là chùa Phật Trắng) là ngôi chùa lớn nhất Nha Trang, nổi tiếng với tượng Phật trắng cao 24m trên đỉnh đồi.",
      moTaChiTiet:
        "Chùa Long Sơn được xây dựng năm 1886, ban đầu nằm trên đồi Trại Thủy. Năm 1900, chùa bị bão phá hủy và được dời xuống chân đồi. Chùa có kiến trúc truyền thống với mái ngói cong, rồng phượng trang trí. Trên đỉnh đồi là tượng Phật Thích Ca Mâu Ni màu trắng cao 24m (xây năm 1963), có thể nhìn thấy từ nhiều nơi trong thành phố.",
      diaChi: "20 Đường 23/10, Phương Sơn, Nha Trang, Khánh Hòa",
      toaDoLat: 12.2487,
      toaDoLng: 109.1762,
      danhMucId: 2,
      capDiTich: CapDiTich.CAP_TINH,
      luotXem: 1890,
    },
    {
      tenDiTich: "Hòn Chồng - Hòn Vợ",
      moTa: "Hòn Chồng là một thắng cảnh thiên nhiên nổi tiếng với những khối đá lớn xếp chồng lên nhau một cách tự nhiên bên bờ biển.",
      moTaChiTiet:
        "Hòn Chồng nằm cách trung tâm Nha Trang khoảng 3,5km về phía Bắc. Nơi đây có những tảng đá lớn xếp chồng lên nhau theo hình thù kỳ lạ do tự nhiên tạo thành. Trên một tảng đá lớn còn có dấu bàn tay khổng lồ, gắn liền với truyền thuyết về chàng khổng lồ ngồi câu cá. Từ Hòn Chồng có thể ngắm nhìn toàn cảnh vịnh Nha Trang tuyệt đẹp.",
      diaChi: "Đường 2/4, Vĩnh Phước, Nha Trang, Khánh Hòa",
      toaDoLat: 12.2692,
      toaDoLng: 109.1983,
      danhMucId: 6,
      capDiTich: CapDiTich.CAP_TINH,
      luotXem: 1234,
    },
    {
      tenDiTich: "Nhà thờ Núi (Nhà thờ Đá)",
      moTa: "Nhà thờ Núi hay còn gọi là Nhà thờ Đá, là nhà thờ Công giáo nổi tiếng nhất Nha Trang, được xây dựng theo phong cách Gothic.",
      moTaChiTiet:
        "Nhà thờ Núi được xây dựng từ năm 1928 đến 1933, tọa lạc trên đỉnh một ngọn đồi nhỏ. Công trình mang phong cách kiến trúc Gothic với tháp chuông cao 38m, mái vòm nhọn và cửa sổ kính màu. Nhà thờ được xây hoàn toàn bằng đá và xi măng, không sử dụng gỗ trong kết cấu chính. Đây là điểm tham quan nổi tiếng của thành phố Nha Trang.",
      diaChi: "1 Thái Nguyên, Phước Tân, Nha Trang, Khánh Hòa",
      toaDoLat: 12.2458,
      toaDoLng: 109.1894,
      danhMucId: 5,
      capDiTich: CapDiTich.CAP_TINH,
      luotXem: 1678,
    },
    {
      tenDiTich: "Đình Phú Cang",
      moTa: "Đình Phú Cang là ngôi đình cổ tiêu biểu tại Ninh Hòa, được xây dựng từ thế kỷ XVIII, thờ Thành Hoàng và các vị tiền hiền.",
      moTaChiTiet:
        "Đình Phú Cang được xây dựng vào khoảng thế kỷ XVIII, là một trong những ngôi đình cổ nhất tại Khánh Hòa. Đình có kiến trúc truyền thống với ba gian hai chái, mái ngói âm dương. Bên trong đình còn lưu giữ nhiều hoành phi, câu đối và sắc phong quý giá. Hàng năm, lễ hội đình được tổ chức vào tháng 2 và tháng 8 âm lịch.",
      diaChi: "Ninh Hòa, Khánh Hòa",
      toaDoLat: 12.498,
      toaDoLng: 109.1387,
      danhMucId: 3,
      capDiTich: CapDiTich.CAP_TINH,
      luotXem: 456,
    },
    {
      tenDiTich: "Am Chúa",
      moTa: "Am Chúa là di tích lịch sử - văn hóa liên quan đến tín ngưỡng thờ Mẫu Thiên Y A Na, nằm trên sườn núi tại xã Diên Điền.",
      moTaChiTiet:
        "Am Chúa tọa lạc trên sườn núi Đại An, xã Diên Điền, huyện Diên Khánh. Đây là nơi thờ Mẫu Thiên Y A Na (Ponagar), gắn liền với truyền thuyết về nữ thần được sinh ra và lớn lên tại đây. Am Chúa là một trong những di tích quan trọng trong hệ thống tín ngưỡng thờ Mẫu tại Khánh Hòa, được công nhận là di tích quốc gia.",
      diaChi: "Xã Diên Điền, huyện Diên Khánh, Khánh Hòa",
      toaDoLat: 12.2833,
      toaDoLng: 109.0667,
      danhMucId: 7,
      capDiTich: CapDiTich.CAP_QUOC_GIA,
      luotXem: 890,
    },
    {
      tenDiTich: "Miếu Trần Quý Cáp",
      moTa: "Miếu thờ Trần Quý Cáp — nhà chí sĩ yêu nước trong phong trào Duy Tân đầu thế kỷ XX, bị triều Nguyễn xử chém tại Khánh Hòa.",
      moTaChiTiet:
        "Trần Quý Cáp (1870-1908) là nhà nho yêu nước, một trong những lãnh tụ phong trào Duy Tân tại miền Trung. Ông bị triều đình Huế xử chém tại Khánh Hòa năm 1908. Miếu thờ ông được xây dựng để tưởng nhớ công lao và tinh thần yêu nước. Tên ông được đặt cho nhiều đường phố tại Nha Trang và các thành phố khác.",
      diaChi: "Nha Trang, Khánh Hòa",
      toaDoLat: 12.2388,
      toaDoLng: 109.1967,
      danhMucId: 7,
      capDiTich: CapDiTich.CAP_TINH,
      luotXem: 345,
    },
    {
      tenDiTich: "Đình Phước Hải",
      moTa: "Đình Phước Hải là ngôi đình cổ tại Nha Trang, được xây dựng từ thế kỷ XIX, thờ Thành Hoàng và các bậc tiền hiền khai canh.",
      moTaChiTiet:
        "Đình Phước Hải nằm tại phường Phước Hải, thành phố Nha Trang. Đình được xây dựng vào thế kỷ XIX, có kiến trúc đình làng truyền thống Việt Nam. Đình là nơi sinh hoạt văn hóa, tín ngưỡng của cộng đồng dân cư, với lễ hội cúng đình hàng năm. Đình còn lưu giữ nhiều hiện vật có giá trị lịch sử và văn hóa.",
      diaChi: "Phước Hải, Nha Trang, Khánh Hòa",
      toaDoLat: 12.235,
      toaDoLng: 109.193,
      danhMucId: 3,
      capDiTich: CapDiTich.CAP_TINH,
      luotXem: 289,
    },
    {
      tenDiTich: "Citadel of Diên Khánh - Cổng phía Đông",
      moTa: "Cổng phía Đông của Thành cổ Diên Khánh là một trong những cổng thành còn nguyên vẹn nhất, tiêu biểu cho kiến trúc quân sự thời Nguyễn.",
      moTaChiTiet:
        "Cổng Đông là cổng thành được bảo tồn tốt nhất trong số các cổng thành của Thành cổ Diên Khánh. Cổng có kiến trúc vòm cuốn, xây bằng gạch và đá, phía trên có vọng lâu. Cổng thành là điểm nhấn quan trọng trong quần thể di tích Thành cổ Diên Khánh.",
      diaChi: "Thị trấn Diên Khánh, huyện Diên Khánh, Khánh Hòa",
      toaDoLat: 12.2601,
      toaDoLng: 109.1028,
      danhMucId: 8,
      capDiTich: CapDiTich.CAP_QUOC_GIA,
      luotXem: 567,
    },
  ];

  for (const dt of diTichs) {
    const slug = generateSlug(dt.tenDiTich);
    await prisma.diTich.upsert({
      where: { slug },
      update: {},
      create: { ...dt, slug },
    });
  }

  console.log(`Seeded ${diTichs.length} di tích`);

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

  // Seed bài viết mẫu
  const baiViets = [
    {
      tieuDe: "Tháp Bà Ponagar - Biểu tượng văn hóa Chăm Pa tại Nha Trang",
      noiDung:
        "<p>Tháp Bà Ponagar là một trong những quần thể di tích kiến trúc Chăm Pa tiêu biểu nhất còn tồn tại tại Việt Nam. Nằm trên đỉnh đồi Cù Lao, bên cạnh cửa sông Cái, quần thể tháp này không chỉ là di tích lịch sử mà còn là nơi sinh hoạt tín ngưỡng quan trọng của người dân Khánh Hòa.</p><p>Hàng năm, lễ hội Tháp Bà Ponagar thu hút đông đảo người dân và du khách đến tham quan, dâng hương và tìm hiểu giá trị văn hóa Chăm Pa.</p>",
      hinhAnh: articleImages.thapBaPonagar,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-05-20T08:00:00.000Z"),
    },
    {
      tieuDe: "Khám phá Thành cổ Diên Khánh - Dấu ấn lịch sử nhà Nguyễn",
      noiDung:
        "<p>Thành cổ Diên Khánh được xây dựng năm 1793 dưới thời chúa Nguyễn Ánh, là một công trình quân sự quan trọng trong lịch sử Việt Nam. Thành có hình lục giác không đều với chu vi gần 2.700m.</p><p>Mặc dù đã trải qua hơn 200 năm, nhiều đoạn tường thành và cổng thành vẫn còn nguyên vẹn, minh chứng cho một thời kỳ lịch sử đầy biến động.</p>",
      hinhAnh: articleImages.thanhCoDienKhanh,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-05-16T08:00:00.000Z"),
    },
    {
      tieuDe: "Chùa Long Sơn và tượng Phật Trắng - Biểu tượng tâm linh Nha Trang",
      noiDung:
        "<p>Tọa lạc trên đường 23/10, Chùa Long Sơn là ngôi chùa lớn và nổi tiếng nhất thành phố Nha Trang. Điểm nhấn của chùa là bức tượng Phật Thích Ca Mâu Ni màu trắng cao 24m trên đỉnh đồi Trại Thủy.</p><p>Chùa không chỉ là nơi tu hành mà còn là điểm tham quan văn hóa thu hút đông đảo du khách khi đến Khánh Hòa.</p>",
      hinhAnh: articleImages.chuaLongSon,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-05-12T08:00:00.000Z"),
    },
    {
      tieuDe: "Hòn Chồng - Hòn Vợ: Điểm nhấn danh thắng ven biển Nha Trang",
      noiDung:
        "<p>Hòn Chồng - Hòn Vợ là danh thắng nổi bật của thành phố Nha Trang, gây ấn tượng bởi những khối đá tự nhiên xếp chồng lên nhau bên bờ biển. Không gian nơi đây kết hợp giữa cảnh quan biển, núi và các câu chuyện dân gian giàu màu sắc.</p><p>Trong định hướng phát huy giá trị di sản, khu vực Hòn Chồng tiếp tục là điểm đến quan trọng phục vụ tham quan, học tập và quảng bá hình ảnh văn hóa biển đảo Khánh Hòa.</p>",
      hinhAnh: articleImages.honChongHonVo,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-05-08T08:00:00.000Z"),
    },
    {
      tieuDe: "Am Chúa và tín ngưỡng thờ Thiên Y A Na tại Khánh Hòa",
      noiDung:
        "<p>Am Chúa là di tích gắn với tín ngưỡng thờ Thiên Y A Na, một lớp văn hóa dân gian có vị trí đặc biệt trong đời sống tinh thần của người dân Khánh Hòa. Không gian di tích nằm giữa cảnh quan núi đồi yên tĩnh, tạo nên nét trang nghiêm và gần gũi.</p><p>Việc gìn giữ, giới thiệu giá trị Am Chúa góp phần giúp cộng đồng hiểu sâu hơn về tín ngưỡng bản địa, truyền thống tri ân tiền nhân và sự giao thoa văn hóa trên vùng đất Khánh Hòa.</p>",
      hinhAnh: articleImages.amChua,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-05-03T08:00:00.000Z"),
    },
    {
      tieuDe: "Nhà thờ Núi Nha Trang - Dấu ấn kiến trúc Gothic giữa lòng phố biển",
      noiDung:
        "<p>Nhà thờ Núi, còn gọi là Nhà thờ Đá, là công trình kiến trúc quen thuộc tại trung tâm thành phố Nha Trang. Với tháp chuông cao, các vòm cửa nhọn và chất liệu đá đặc trưng, công trình mang vẻ đẹp cổ kính giữa nhịp sống hiện đại.</p><p>Không chỉ là nơi sinh hoạt tôn giáo, Nhà thờ Núi còn là địa điểm tham quan được nhiều du khách lựa chọn khi tìm hiểu lịch sử đô thị và kiến trúc tại Khánh Hòa.</p>",
      hinhAnh: articleImages.nhaThoNui,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-04-28T08:00:00.000Z"),
    },
    {
      tieuDe: "Đình Phú Cang - Không gian văn hóa làng cổ tại Ninh Hòa",
      noiDung:
        "<p>Đình Phú Cang là một trong những di tích tiêu biểu phản ánh đời sống văn hóa làng xã tại thị xã Ninh Hòa. Công trình lưu giữ dấu ấn kiến trúc đình làng truyền thống cùng các sinh hoạt tín ngưỡng gắn bó với cộng đồng địa phương.</p><p>Các hoạt động bảo tồn và phát huy giá trị đình làng giúp thế hệ trẻ hiểu thêm về lịch sử khai khẩn, truyền thống uống nước nhớ nguồn và bản sắc văn hóa của vùng đất Ninh Hòa.</p>",
      hinhAnh: articleImages.dinhPhuCang,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-04-23T08:00:00.000Z"),
    },
    {
      tieuDe: "Miếu Trần Quý Cáp - Ghi nhớ tinh thần yêu nước đầu thế kỷ XX",
      noiDung:
        "<p>Miếu Trần Quý Cáp là địa chỉ tưởng niệm nhà chí sĩ yêu nước trong phong trào Duy Tân đầu thế kỷ XX. Di tích góp phần nhắc nhớ về truyền thống hiếu học, tinh thần canh tân và lòng yêu nước của các bậc tiền nhân.</p><p>Thông qua việc giới thiệu di tích, công tác giáo dục truyền thống lịch sử tại địa phương có thêm tư liệu gần gũi, giúp người dân và du khách nhận diện rõ hơn những dấu mốc văn hóa - lịch sử của Khánh Hòa.</p>",
      hinhAnh: articleImages.mieuTranQuyCap,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-04-18T08:00:00.000Z"),
    },
    {
      tieuDe: "Đình Phước Hải và nét sinh hoạt tín ngưỡng cộng đồng ở Nha Trang",
      noiDung:
        "<p>Đình Phước Hải là ngôi đình gắn với đời sống văn hóa, tín ngưỡng của cư dân Nha Trang. Không gian đình lưu giữ nhiều giá trị về kiến trúc, phong tục và ký ức cộng đồng qua các kỳ lễ hội truyền thống.</p><p>Việc bảo tồn các đình làng như Đình Phước Hải góp phần làm phong phú bản đồ di sản văn hóa đô thị, đồng thời tạo thêm điểm đến để người dân tìm hiểu lịch sử địa phương.</p>",
      hinhAnh: articleImages.dinhPhuocHai,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-04-12T08:00:00.000Z"),
    },
    {
      tieuDe: "Đình Vĩnh Điềm - Dấu ấn văn hóa làng xã ở Khánh Hòa",
      noiDung:
        "<p>Đình Vĩnh Điềm là một không gian văn hóa cộng đồng tiêu biểu, gắn với quá trình hình thành và phát triển của cư dân địa phương. Kiến trúc đình cùng các nghi lễ truyền thống phản ánh đời sống tinh thần phong phú của làng xã Khánh Hòa.</p><p>Việc giới thiệu Đình Vĩnh Điềm trên hệ thống di sản giúp người xem có thêm góc nhìn về các thiết chế văn hóa dân gian đang được gìn giữ trong đời sống hôm nay.</p>",
      hinhAnh: articleImages.dinhVinhDiem,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-04-06T08:00:00.000Z"),
    },
    {
      tieuDe: "Đình Vạn Thạnh và ký ức cộng đồng vùng biển Nha Trang",
      noiDung:
        "<p>Đình Vạn Thạnh là nơi lưu giữ nhiều giá trị văn hóa gắn với cư dân vùng biển. Không gian đình không chỉ phục vụ sinh hoạt tín ngưỡng mà còn là điểm tựa tinh thần của cộng đồng qua nhiều thế hệ.</p><p>Các hoạt động bảo tồn di tích góp phần gìn giữ ký ức làng biển, đồng thời tạo điều kiện để người dân và du khách hiểu thêm về nếp sống văn hóa ven biển Khánh Hòa.</p>",
      hinhAnh: articleImages.dinhVanThanh,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-03-30T08:00:00.000Z"),
    },
    {
      tieuDe: "Đình Bình Tân - Nơi lưu giữ nếp xưa trong lòng đô thị",
      noiDung:
        "<p>Đình Bình Tân là một trong những di tích phản ánh quá trình cư trú, khai khẩn và xây dựng cộng đồng tại khu vực Nha Trang. Trong nhịp phát triển đô thị, đình vẫn giữ vai trò quan trọng trong đời sống văn hóa địa phương.</p><p>Không gian di tích là nơi diễn ra các nghi lễ truyền thống, góp phần duy trì bản sắc và sự gắn kết của cư dân qua nhiều thế hệ.</p>",
      hinhAnh: articleImages.dinhBinhTan,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-03-24T08:00:00.000Z"),
    },
    {
      tieuDe: "Đình Thủy Tú - Giá trị kiến trúc và tín ngưỡng truyền thống",
      noiDung:
        "<p>Đình Thủy Tú mang trong mình nhiều giá trị về kiến trúc, lịch sử và tín ngưỡng dân gian. Những đường nét trang trí, không gian thờ tự và sinh hoạt lễ hội tạo nên bản sắc riêng của di tích.</p><p>Việc bảo tồn Đình Thủy Tú góp phần làm giàu thêm hệ thống di sản văn hóa cơ sở, giúp công chúng tiếp cận gần hơn với những giá trị truyền thống tại Khánh Hòa.</p>",
      hinhAnh: articleImages.dinhThuyTu,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-03-18T08:00:00.000Z"),
    },
    {
      tieuDe: "Đình Lư Cấm - Điểm tựa văn hóa của cư dân địa phương",
      noiDung:
        "<p>Đình Lư Cấm là một địa chỉ văn hóa quen thuộc, gắn với tín ngưỡng thờ Thành Hoàng và các bậc tiền hiền. Di tích góp phần phản ánh lịch sử cộng đồng, phong tục và truyền thống uống nước nhớ nguồn.</p><p>Thông qua công tác số hóa và giới thiệu trên website, các giá trị của Đình Lư Cấm có thể tiếp cận rộng hơn đến học sinh, người dân và du khách quan tâm đến di sản Khánh Hòa.</p>",
      hinhAnh: articleImages.dinhLuCam,
      tacGiaId: adminProfile.id,
      createdAt: new Date("2026-03-10T08:00:00.000Z"),
    },
  ];

  for (const bv of baiViets) {
    const slug = generateSlug(bv.tieuDe);
    await prisma.baiViet.upsert({
      where: { slug },
      update: {
        noiDung: bv.noiDung,
        hinhAnh: bv.hinhAnh,
        tacGiaId: bv.tacGiaId,
        trangThai: true,
        createdAt: bv.createdAt,
      },
      create: { ...bv, slug },
    });
  }

  console.log(`Seeded ${baiViets.length} bài viết`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // process.exit(1);
  });
