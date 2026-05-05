import Link from "next/link";
import { LuLandmark, LuClock, LuMapPin, LuPhone } from "react-icons/lu";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LuLandmark className="h-6 w-6 text-teal-600" />
              <span className="text-xl font-bold text-teal-800 font-heading">Di Tích Khánh Hòa</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Website quản lí và quảng bá các di tích cấp tỉnh và cấp quốc gia trên địa bàn tỉnh Khánh Hòa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-teal-700 font-bold font-heading mb-4">Khám phá</h4>
            <ul className="space-y-3">
              <li><Link href="/di-san-van-hoa" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">Di sản văn hoá</Link></li>
              <li><Link href="/ban-do" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">Bản đồ di tích</Link></li>
              <li><Link href="/tin-tuc" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">Tin tức & Bài viết</Link></li>
              <li><Link href="/tim-kiem" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">Tìm kiếm di tích</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-teal-700 font-bold font-heading mb-4">Thông tin</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-1.5 text-sm text-slate-500">
                <LuMapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                Nha Trang, Khánh Hòa
              </li>
              <li className="flex items-center gap-1.5 text-sm text-slate-500">
                <LuPhone className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                Đại học Nha Trang
              </li>
              <li className="flex items-center gap-1.5 text-sm text-slate-500">
                <LuClock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                Đồ án tốt nghiệp 2026
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © 2026 Di Tích Khánh Hòa. All rights reserved.
          </p>
          <p className="text-sm text-slate-400">
            Nguyễn Hiểu Quyên — MSSV: 64131973
          </p>
        </div>
      </div>
    </footer>
  );
}
