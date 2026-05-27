import { LuBuilding2 } from "react-icons/lu";

const departments = [
  "Phòng Hành chính - Tổng hợp",
  "Phòng Nghiệp vụ Bảo tồn di tích",
  "Phòng Kế hoạch - Tài chính",
  "Ban Quản lý di tích Tháp Bà Ponagar",
  "Ban Quản lý danh thắng Hòn Chồng - Hòn Đỏ",
  "Đội Bảo vệ",
];

export default function BoMayToChucPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 md:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase text-teal-700">
          <LuBuilding2 className="h-3.5 w-3.5" />
          Thông tin đơn vị
        </span>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 font-heading">
          Bộ máy tổ chức Trung tâm bảo tồn di sản văn hoá
        </h1>

        <div className="mt-6 space-y-8 text-slate-700">
          <div>
            <p className="text-base leading-7">
              Bộ máy tổ chức của Trung tâm bảo tồn di sản văn hoá gồm:
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">1. Lãnh đạo Trung tâm</h2>
            <p className="mt-3 text-base leading-7">
              Lãnh đạo gồm 01 Giám đốc và không quá 03 Phó Giám đốc.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              2. Các bộ phận chuyên môn, nghiệp vụ
            </h2>
            <ul className="mt-4 space-y-3">
            {departments.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-7">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                <span>{item}</span>
              </li>
            ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
