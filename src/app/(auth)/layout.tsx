import { LuLandmark } from "react-icons/lu";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb] p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <LuLandmark className="h-7 w-7 text-teal-600" />
          <span className="text-2xl font-bold text-teal-800 font-heading">Di Tích Khánh Hòa</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
