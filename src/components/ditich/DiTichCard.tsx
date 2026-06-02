import Link from "next/link";
import type { DiTich, DanhMuc, HinhAnh } from "@prisma/client";
import { LuEye, LuMapPin, LuArrowRight } from "react-icons/lu";

interface Props {
  diTich: DiTich & { danhMuc: DanhMuc; hinhAnhs?: HinhAnh[] };
}

export default function DiTichCard({ diTich }: Props) {
  const imageUrl = diTich.hinhAnhDaiDien || diTich.hinhAnhs?.[0]?.url;

  return (
    <Link href={`/di-tich/${(diTich as any).slug || diTich.id}`} prefetch={false} className="group">
      <div className="rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/20 hover:shadow-ambient-teal-lg transition-all duration-300 flex flex-col h-full">
        {/* Image */}
        <div className="aspect-[4/3] bg-gradient-to-br from-teal-100 to-teal-50 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={diTich.tenDiTich}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🏛️</div>
          )}
          <span
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold font-heading ${
              diTich.capDiTich === "CAP_QUOC_GIA"
                ? "bg-emerald-600/90 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            {diTich.capDiTich === "CAP_QUOC_GIA" ? "Quốc gia" : "Cấp tỉnh"}
          </span>
        </div>

        {/* Info */}
        <div className="p-6 md:p-7 flex flex-col flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-[#191c1e] font-heading line-clamp-1">
            {diTich.tenDiTich}
          </h3>
          <p className="text-sm text-[#3d4947] mt-1 flex items-center gap-1.5">
            <LuMapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{diTich.diaChi}</span>
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center bg-teal-50 text-[#00685f] px-3 py-1 rounded-full text-xs font-medium font-heading">
              {diTich.danhMuc.tenDanhMuc}
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <LuEye className="h-4 w-4" /> {diTich.luotXem.toLocaleString("vi-VN")}
            </span>
            <span className="inline-flex items-center gap-1 bg-[#e6e8ea] group-hover:bg-[#008378] group-hover:text-white px-4 py-2 rounded-xl text-xs font-semibold font-heading transition-all">
              Chi tiết <LuArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
