import { LuClipboardList } from "react-icons/lu";

const duties = [
  "Lập kế hoạch và tổ chức kiểm kê, lập danh mục di tích, lập hồ sơ khoa học di tích để trình cấp có thẩm quyền công nhận, xếp hạng theo quy định của pháp luật về di sản văn hóa.",
  "Lập hồ sơ trình cấp có thẩm quyền điều chỉnh khu vực bảo vệ đối với di tích cấp tỉnh, di tích quốc gia theo quy định.",
  "Tổ chức góp ý các dự án bảo quản, tu bổ di tích quốc gia, di tích cấp tỉnh; dự án cải tạo, xây dựng các công trình nằm ngoài khu vực bảo vệ di tích có khả năng ảnh hưởng đến cảnh quan, môi trường của di tích.",
  "Thực hiện công tác cắm mốc, xây dựng bia di tích; tu bổ, phục hồi di tích, danh thắng; tổ chức các hoạt động bảo tồn và phát huy giá trị di sản văn hóa trong tỉnh.",
  "Kiểm tra, hướng dẫn các tổ chức, cá nhân là chủ sở hữu hoặc được giao quản lý, sử dụng di tích đã được xếp hạng thực hiện việc bảo vệ, tu bổ di tích theo đúng quy định của pháp luật.",
  "Tổ chức phục vụ công tác tín ngưỡng, thu phí tham quan và các hoạt động dịch vụ như triển lãm, trưng bày, biểu diễn văn hóa, nghệ thuật; ẩm thực, giải khát, sản phẩm lưu niệm... tại di tích Tháp Bà, danh thắng Hòn Chồng và các di tích khác được giao quản lý trực tiếp để phục vụ nhu cầu tham quan, học tập, nghiên cứu của nhân dân và du khách.",
  "Phối hợp với các phòng chuyên môn thuộc Sở Văn hóa và Thể thao và các phòng Văn hóa và Thông tin huyện, thị xã, thành phố và các đơn vị có liên quan tổ chức, hướng dẫn tuyên truyền, phổ biến Luật Di sản văn hóa và các văn bản pháp luật hiện hành; tham gia các hoạt động bảo tồn và phát huy giá trị di tích, danh thắng trong tỉnh; hướng dẫn tổ chức các lễ hội truyền thống tại di tích theo qui định của pháp luật; vận động nhân dân và các tổ chức xã hội góp phần tôn tạo, tu bổ di tích.",
  "Phối hợp với các phòng chuyên môn thuộc Sở Văn hóa và Thể thao, chính quyền địa phương và các đơn vị, tổ chức có liên quan tổ chức tốt Lễ hội Tháp Bà Ponagar truyền thống hàng năm. Vận động các tổ chức, cá nhân tài trợ, đóng góp tiền, hiện vật để phục vụ nhu cầu tín ngưỡng, tu bổ di tích.",
  "Nghiên cứu, đề xuất và triển khai ứng dụng khoa học công nghệ, hợp tác quốc tế trong hoạt động bảo tồn và phát huy giá trị di sản văn hóa.",
  "Thực hiện công tác quản lý tổ chức bộ máy, nhân sự; quản lý, sử dụng tài chính, tài sản được giao và các nguồn thu theo quy định của pháp luật.",
  "Thực hiện các nhiệm vụ, quyền hạn khác theo yêu cầu của Sở Văn hóa và Thể thao và của Ủy ban nhân dân tỉnh Khánh Hòa giao theo quy định pháp luật.",
];

export default function ChucNangNhiemVuPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 md:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase text-teal-700">
          <LuClipboardList className="h-3.5 w-3.5" />
          Chức năng nhiệm vụ
        </span>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 font-heading">
          Chức năng và nhiệm vụ của Trung tâm bảo tồn di sản văn hoá tỉnh Khánh Hòa
        </h1>

        <div className="mt-6 space-y-8 text-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">1. Vị trí và chức năng</h2>
            <div className="mt-3 space-y-3 text-base leading-7">
              <p>
                Trung tâm Bảo tồn di tích là đơn vị sự nghiệp công lập trực thuộc Sở Văn hóa và Thể thao; có chức năng tổ chức các hoạt động bảo tồn và phát huy giá trị di sản văn hóa.
              </p>
              <p>
                Trung tâm Bảo tồn di tích có tư cách pháp nhân, có trụ sở, có con dấu và tài khoản riêng theo quy định của pháp luật.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">2. Nhiệm vụ và quyền hạn</h2>
            <ul className="mt-4 space-y-4">
              {duties.map((duty) => (
                <li key={duty} className="flex gap-3 text-base leading-7">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                  <span>{duty}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
