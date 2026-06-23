"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChatBubbleBottomCenterTextIcon,
    ChartBarIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

export function HeaderNav() {
    const pathname = usePathname();

    const isPostActive = pathname.startsWith("/main/home");
    const isActivityActive = pathname.startsWith("/main/activity");
    const isSettingActive = pathname.startsWith("/main/setting");
    const isPublishActive = pathname.startsWith("/main/publish");

    const activeStyle = "flex item-center gap-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-4 transition-colors";
    const inactiveStyle = "flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 pb-4 border-b-2 border-transparent transition-colors";

    return (
        <div className = "flex gap-8">
            <Link href="/main/home" className="inline-block">
                <button className={isPostActive ? activeStyle : inactiveStyle}>
                    <ChatBubbleBottomCenterTextIcon className = "w-5 h-5 "/> Post
                </button>
            </Link>
            <Link href="/main/activity" className="inline-block">
                <button className={isActivityActive ? activeStyle : inactiveStyle}>
                    <ChartBarIcon className="w-5 h-5" /> Activity
                </button>
            </Link>

            <Link href="/main/setting" className="inline-block">
                <button className={isSettingActive ? activeStyle : inactiveStyle}>
                <Cog6ToothIcon className="w-5 h-5" /> Setting
                </button>
            </Link>
            <Link href="/main/publish" className="inline-block">
                <button className={isPublishActive ? activeStyle : inactiveStyle}>
                <Cog6ToothIcon className="w-5 h-5" /> Publish
                </button>
            </Link>
        </div>
    )
}