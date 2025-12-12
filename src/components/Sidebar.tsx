"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Film,
  Wand2,
  FileText,
  History,
  Settings,
  LogOut,
  Users,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard/workflow", icon: Wand2, label: "워크플로우" },
  { href: "/dashboard/characters", icon: Users, label: "캐릭터 관리" },
  { href: "/dashboard/prompts", icon: FileText, label: "프롬프트" },
  { href: "/dashboard/history", icon: History, label: "생성 기록" },
  { href: "/dashboard/settings", icon: Settings, label: "설정" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">화수분 영상 생성기</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-medium text-white">
            {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || "사용자"}
            </p>
            <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-2 w-full text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
