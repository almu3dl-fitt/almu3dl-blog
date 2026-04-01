"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdminLoggedIn, logoutAdmin } from "./auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isClient = typeof window !== "undefined";
  const isAuthenticated = isClient && isAdminLoggedIn();

  useEffect(() => {
    if (!isClient) return;

    if (!isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
      return;
    }

    if (isAuthenticated && pathname === "/admin/login") {
      router.push("/admin");
    }
  }, [isClient, isAuthenticated, pathname, router]);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">جاري التحقق من صلاحيات المشرف...</p>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  const navItems = [
    { href: "/admin", label: "لوحة التحكم", icon: "📊" },
    { href: "/admin/articles", label: "المقالات", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              لوحة تحكم المعضّل
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← العودة للموقع
              </Link>

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logoutAdmin();
                    router.push("/admin/login");
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  تسجيل الخروج
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
