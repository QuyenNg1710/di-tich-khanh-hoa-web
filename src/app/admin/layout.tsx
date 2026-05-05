"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LuLandmark, LuLayoutDashboard, LuUsers, LuTag, LuLogOut, LuMenu, LuX, LuNewspaper } from "react-icons/lu";
import { HiHome } from "react-icons/hi";

const MENU = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/admin/di-tich", label: "Di tích", icon: LuLandmark },
  { href: "/admin/tin-tuc", label: "Bài viết", icon: LuNewspaper },
  { href: "/admin/tai-khoan", label: "Tài khoản", icon: LuUsers },
  { href: "/admin/danh-muc", label: "Danh mục", icon: LuTag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5">
        <div className="h-9 w-9 bg-[#0D9488] text-white rounded-xl flex items-center justify-center">
          <LuLandmark className="h-5 w-5" />
        </div>
        <div className="text-lg font-bold tracking-tight font-heading">
          <span className="text-white">Di Tích </span>
          <span className="text-teal-400">KH</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading transition-all ${
                active
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[#0D9488] rounded-r-full" />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white/80 font-heading"
        >
          <HiHome className="h-5 w-5" />
          <span>Trang chủ</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white/80 font-heading"
        >
          <LuLogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-[#0A1628] sticky top-0 h-screen flex-col hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0A1628] rounded-xl shadow-lg text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-40 w-60 bg-[#0A1628] flex flex-col lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
