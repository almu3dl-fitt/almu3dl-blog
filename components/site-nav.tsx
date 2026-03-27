"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "@/lib/site";

function joinClasses(...values: Array<string | false>) {
  return values.filter(Boolean).join(" ");
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="flex items-center gap-1 overflow-x-auto pb-1 md:overflow-visible"
    >
      {NAV_LINKS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={joinClasses(
              "rounded-full px-4 py-2 text-sm font-medium transition whitespace-nowrap",
              isActive
                ? "theme-pill-active"
                : "theme-pill",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
