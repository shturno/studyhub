"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AppSidebar({ className, user }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("AppSidebar");

  const navItems = [
    { title: t("navDashboard"), href: "/dashboard", emoji: "🕹" },
    { title: t("navPlanner"), href: "/planner", emoji: "📅" },
    { title: t("navSubjects"), href: "/subjects", emoji: "📖" },
    { title: t("navContests"), href: "/contests", emoji: "🎯" },
    { title: t("navReviews"), href: "/reviews", emoji: "🔁" },
    { title: t("navAchievements"), href: "/gamification", emoji: "🏆" },
  ];

  return (
    <div
      className={cn(
        "pb-12 h-full overflow-y-auto bg-[#04000a] flex flex-col",
        className,
      )}
      style={{
        borderRight: "2px solid #00ff41",
        boxShadow: "4px 0 20px rgba(0,255,65,0.15)",
      }}
    >
      <div className="px-4 py-6 border-b-2 border-[#00ff41]">
        <Link href="/dashboard" className="block text-center">
          <div
            className="text-[#00ff41] font-pixel text-sm leading-loose"
            style={{
              textShadow:
                "0 0 10px rgba(0,255,65,0.8), 0 0 20px rgba(0,255,65,0.4)",
            }}
          >
            {t("titleStudy")}
          </div>
          <div
            className="text-[#ff006e] font-pixel text-sm leading-loose"
            style={{
              textShadow:
                "0 0 10px rgba(255,0,110,0.8), 0 0 20px rgba(255,0,110,0.4)",
            }}
          >
            {t("titleHub")}
          </div>
          <div className="text-[#00ff41] font-pixel text-[8px] mt-1 animate-blink">
            {t("select")}
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 transition-all duration-100 font-pixel text-[9px] tracking-wide",
                  isActive
                    ? "bg-[#00ff41] text-black"
                    : "text-[#00ff41] hover:bg-[#00ff41]/10",
                )}
                style={isActive ? { boxShadow: "2px 2px 0px #006b1a" } : {}}
              >
                <span className="text-base">{item.emoji}</span>
                {isActive && <span className="text-[9px]">►</span>}
                {item.title}
              </div>
            </Link>
          );
        })}
      </nav>

      <div
        className="mx-2 mb-4 p-3"
        style={{ border: "2px solid #00ff41", background: "#04000a" }}
      >
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#00ff41]/30">
          <div className="w-10 h-10 flex items-center justify-center bg-[#00ff41] text-black font-pixel text-sm">
            {user?.name?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#00ff41] font-pixel text-[7px] truncate">
              {user?.name?.toUpperCase() || t("player1")}
            </p>
            <p className="text-[#7f7f9f] font-mono text-sm truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Link href="/settings" className="block">
            <div className="text-[#7f7f9f] hover:text-[#00ff41] font-pixel text-[7px] px-2 py-2 hover:bg-[#00ff41]/5 transition-colors">
              {t("config")}
            </div>
          </Link>
          <button
            className="w-full text-left text-[#ff006e] hover:text-[#ff006e] font-pixel text-[7px] px-2 py-2 hover:bg-[#ff006e]/5 transition-colors"
            onClick={() => signOut()}
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
