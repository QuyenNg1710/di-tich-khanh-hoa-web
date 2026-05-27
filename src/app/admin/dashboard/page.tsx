"use client";

import { useEffect, useState } from "react";
import { LuLandmark, LuBookOpen, LuUsers, LuEye } from "react-icons/lu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Stats {
  tongDiTich: number;
  tongBaiViet: number;
  tongNguoiDung: number;
  tongLuotXem: number;
}

interface RecentReview {
  id: number;
  diemSo: number;
  user?: { fullName: string | null } | null;
  diTich?: { tenDiTich: string } | null;
}

const COLORS = ["#0D9488", "#F59E0B", "#10B981", "#F97316", "#EAB308", "#06B6D4", "#EC4899", "#8B5CF6"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topDiTich, setTopDiTich] = useState<{ tenDiTich: string; luotXem: number }[]>([]);
  const [chartDanhMuc, setChartDanhMuc] = useState<{ name: string; value: number }[]>([]);
  const [chartDonVi, setChartDonVi] = useState<{ name: string; value: number }[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/thongke?type=tong-quan").then((r) => r.json()),
      fetch("/api/thongke?type=top-di-tich").then((r) => r.json()),
      fetch("/api/thongke?type=di-tich-theo-danh-muc").then((r) => r.json()),
      fetch("/api/thongke?type=di-tich-theo-don-vi").then((r) => r.json()),
      fetch("/api/thongke?type=danh-gia-gan-day").then((r) => r.json()),
    ]).then(([s, top, dm, dv, rv]) => {
      setStats(s);
      setTopDiTich(top);
      setChartDanhMuc(dm);
      setChartDonVi(dv);
      setRecentReviews(rv);
    });
  }, []);

  if (!stats) return <div className="text-center py-16 text-slate-500">Đang tải...</div>;

  const kpis = [
    { label: "Tổng di tích", value: stats.tongDiTich, icon: LuLandmark, iconColor: "text-teal-600", iconBg: "bg-teal-50" },
    { label: "Bài viết", value: stats.tongBaiViet, icon: LuBookOpen, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
    { label: "Người dùng", value: stats.tongNguoiDung, icon: LuUsers, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
    { label: "Tổng lượt xem", value: stats.tongLuotXem, icon: LuEye, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#0A1628] font-heading">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{kpi.label}</p>
                  <p className="text-lg font-bold text-slate-700 font-heading">
                    {(kpi.value ?? 0).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top di tích */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-bold text-[#0A1628] font-heading mb-4">Top lượt xem</h3>
          {topDiTich.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDiTich.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="tenDiTich" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="luotXem" fill="#0D9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-400 py-8">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Pie chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-bold text-[#0A1628] font-heading mb-4">Theo danh mục</h3>
          {chartDanhMuc.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartDanhMuc} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {chartDanhMuc.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-400 py-8">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-[#0A1628] font-heading mb-4">Theo đơn vị quản lý</h3>
        {chartDonVi.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDonVi} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#F59E0B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 py-8">Chưa có dữ liệu</p>
        )}
      </div>

      {/* Recent reviews */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-[#0A1628] font-heading mb-4">Đánh giá gần đây</h3>
        {recentReviews.length > 0 ? (
          <div className="space-y-3">
            {recentReviews.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 text-sm py-2 border-b border-slate-100 last:border-0">
                <span className="shrink-0">{"⭐".repeat(r.diemSo)}</span>
                <span className="font-medium text-slate-700">{r.user?.fullName}</span>
                <span className="text-slate-400">→</span>
                <span className="font-medium text-teal-700">{r.diTich?.tenDiTich}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 py-4">Chưa có đánh giá</p>
        )}
      </div>
    </div>
  );
}
