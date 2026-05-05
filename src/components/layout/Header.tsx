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
import { LuLandmark } from "react-icons/lu";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/di-san-van-hoa", label: "Di sản văn hoá" },
  { href: "/ban-do", label: "Bản đồ" },
  { href: "/tin-tuc", label: "Tin tức" },
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
    <header className="fixed top-4 left-0 right-0 mx-auto w-[92%] max-w-7xl z-50">
      <nav className="glass-nav rounded-2xl border border-white/20 px-5 md:px-8 py-3 shadow-ambient-teal">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 md:gap-2">
            <LuLandmark className="h-5 w-5 md:h-6 md:w-6 text-teal-600" />
            <span className="font-bold text-base sm:text-xl md:text-2xl text-teal-800 font-heading whitespace-nowrap">
              Di Tích Khánh Hòa
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-tight font-heading transition-colors ${
                    active
                      ? "text-teal-600 border-b-2 border-teal-600 font-semibold pb-0.5"
                      : "text-slate-600 hover:text-teal-500"
                  }`}
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
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-heading font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
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
