"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  Scale,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/group", label: "Squad", icon: Users },
  { href: "/weigh-in", label: "Weigh-in", icon: Scale },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-lg safe-area-pb">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                isActive
                  ? "text-orange-500"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
