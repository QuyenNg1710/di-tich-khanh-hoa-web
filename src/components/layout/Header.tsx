"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { HiMenu, HiX } from "react-icons/hi";
import { LuChevronDown, LuLandmark } from "react-icons/lu";

const NAV_LINKS = [
  {
    href: "/",
    label: "Trang chủ",
    children: [
      { href: "/bo-may-to-chuc", label: "Bộ máy tổ chức" },
      { href: "/chuc-nang-nhiem-vu", label: "Chức năng nhiệm vụ" },
      { href: "/cai-cach-hanh-chinh", label: "Cải cách hành chính" },
    ],
  },
  { href: "/di-san-van-hoa", label: "Di sản văn hoá" },
  { href: "/ban-do", label: "Bản đồ di tích" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/lien-he", label: "Liên hệ" },
];

interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setLoaded(true);
        return;
      }

      // Luôn lấy từ API profile (có role chính xác từ DB)
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch("/api/auth/profile");
          if (res.ok) {
            const profile = await res.json();
            if (profile.id) {
              setUser({
                id: profile.id,
                fullName: profile.fullName,
                email: profile.email || authUser.email || "",
                role: profile.role,
              });
              setLoaded(true);
              return;
            }
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 500));
      }

      // Fallback cuối cùng nếu profile chưa tạo kịp
      setUser({
        id: authUser.id,
        fullName: authUser.user_metadata?.full_name || authUser.email || "User",
        email: authUser.email || "",
        role: "USER",
      });
      setLoaded(true);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <nav className="glass-nav border-b border-white/30 shadow-ambient-teal">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-1.5 md:gap-2">
            <LuLandmark className="h-5 w-5 md:h-6 md:w-6 text-teal-600" />
            <span className="flex flex-col leading-none">
              <span className="font-bold text-base sm:text-xl md:text-2xl text-teal-800 font-heading whitespace-nowrap uppercase">
                Di Tích Khánh Hòa
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[10px] md:text-xs">
                Trung tâm bảo tồn di sản văn hoá
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || link.children?.some((item) => item.href === pathname);
              const linkClassName = `text-sm font-medium font-heading uppercase transition-colors ${
                active
                  ? "text-teal-600 border-b-2 border-teal-600 font-semibold pb-0.5"
                  : "text-slate-600 hover:text-teal-500"
              }`;

              if (link.children) {
                return (
                  <div key={link.href} className="group relative">
                    <Link href={link.href} className={`${linkClassName} inline-flex items-center gap-1.5`}>
                      {link.label}
                      <LuChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                    </Link>

                    <div className="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-5 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                      <div className="relative rounded-xl border border-slate-100 bg-white py-2 shadow-xl">
                        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-slate-100 bg-white" />
                        {link.children.map((child, index) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-7 py-4 text-base font-medium text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700 ${
                              index > 0 ? "border-t border-slate-200" : ""
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClassName}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!loaded ? (
              <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-teal-100">
                    <AvatarFallback className="bg-teal-50 text-teal-700 text-sm font-heading font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium font-heading">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = "/yeu-thich"}>
                    Yêu thích
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => window.location.href = "/admin/dashboard"}>
                      Quản trị
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/dang-nhap"
                className="inline-flex items-center bg-[#008378] hover:bg-[#00685f] text-white px-6 py-2.5 rounded-xl text-sm font-semibold font-heading active:scale-95 transition-all"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-slate-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-white/20 bg-white/95 p-6 shadow-lg backdrop-blur-xl md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || link.children?.some((item) => item.href === pathname);

                return (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-heading font-medium uppercase transition-colors ${
                        active
                          ? "bg-teal-50 text-teal-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {link.label}
                      {link.children && <LuChevronDown className="h-3.5 w-3.5" />}
                    </Link>

                    {link.children && (
                      <div className="mt-1 space-y-1 pl-4">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block rounded-lg px-3 py-2 text-sm font-heading transition-colors ${
                              pathname === child.href
                                ? "bg-teal-50 text-teal-700 font-semibold"
                                : "text-slate-500 hover:bg-slate-50 hover:text-teal-600"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="border-t border-slate-100 pt-3 mt-1">
                {user ? (
                  <>
                    <p className="px-3 py-1 text-sm font-medium">{user.fullName}</p>
                    <p className="px-3 pb-2 text-xs text-muted-foreground">{user.email}</p>
                    <Link href="/yeu-thich" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-slate-600 font-heading">
                      Yêu thích
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-slate-600 font-heading">
                        Quản trị
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-red-500 font-heading">
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    href="/dang-nhap"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center bg-[#008378] text-white py-2.5 rounded-xl text-sm font-semibold font-heading"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
