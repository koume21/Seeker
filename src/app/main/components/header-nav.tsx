"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatBubbleLeftRightIcon, // Post 用
  SignalIcon,             // Activity 用 (縦棒グラフ風)
  Cog6ToothIcon,          // Setting 用
  GlobeAltIcon,           // Publish 用 (またはクラウドマーク)
} from '@heroicons/react/24/outline';

export function HeaderNav() {
  const pathname = usePathname();

  const isPostActive = pathname.startsWith("/main/home");
  const isActivityActive = pathname.startsWith("/main/activity");
  const isSettingActive = pathname.startsWith("/main/setting");
  const isPublishActive = pathname.startsWith("/main/publish");

  // 画像の「うっすら青い背景の角丸ボタン」を再現するスタイル
  const activeStyle = "flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md transition-colors";
  const inactiveStyle = "flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 border border-transparent rounded-md transition-colors";

  return (
    <div className="flex gap-4 items-center">
      {/* Post */}
      <Link href="/main/home" className="inline-block">
        <button className={isPostActive ? activeStyle : inactiveStyle}>
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          <span>Post</span>
        </button>
      </Link>
      
      {/* Activity */}
      <Link href="/main/activity" className="inline-block">
        <button className={isActivityActive ? activeStyle : inactiveStyle}>
          <SignalIcon className="w-4 h-4 rotate-90 scale-y-[-1]" /> {/* グラフっぽく見せる調整 */}
          <span>Activity</span>
        </button>
      </Link>

      {/* Setting */}
      <Link href="/main/setting" className="inline-block">
        <button className={isSettingActive ? activeStyle : inactiveStyle}>
          <Cog6ToothIcon className="w-4 h-4" />
          <span>Setting</span>
        </button>
      </Link>
      
      {/* Publish */}
      <Link href="/main/publish" className="inline-block">
        <button className={isPublishActive ? activeStyle : inactiveStyle}>
          <GlobeAltIcon className="w-4 h-4" />
          <span>Publish</span>
        </button>
      </Link>
    </div>
  );
}