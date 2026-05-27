// src/app/main/layout.tsx
import { auth, signOut } from "@/auth";
import Link from "next/link";
import {prisma} from '@/lib/prisma';
import { MainProvider } from './components/user-provider';
import { 
  ChevronRightIcon, 
  PlusIcon, 
  ArrowRightStartOnRectangleIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.id) return[];
    const userId = session.user.id;

    const languages = await prisma.language.findMany(
    { 
            where: {
                posts: {
                    some: {
                        userId:userId
                    }
                }
            },
        }
    );

    return (
        <div className="flex h-screen bg-white text-gray-800">
            {/* --- 共通サイドバー --- */}
            <aside className="w-64 border-r border-gray-200 flex flex-col h-full shrink-0">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                {session?.user?.image ? (
                <img
                    src={session.user.image}
                    alt={session.user.name ?? "user icon"}
                    className="w-8 h-8 rounded-full object-cover"
                />
                ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {session?.user?.name?.charAt(0)}
                </div>
                )}
                <span className="font-semibold">{session?.user?.name}</span>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
                {languages.map((item) => (
                <Link
                    key={item.name}
                    href={`/main/home?lang=${item.name}`}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group"
                >
                    <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-gray-400 group-hover:border-blue-500 transition-colors"></div>
                    <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </Link>
                ))}
                {/* ログアウトボタン */}
                <div className="p-4 border-t border-gray-200">
                <form
                    action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                    }}
                >
                    <button type="submit" className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </form>
                </div>
            </nav>
            </aside>

            {/* --- メインコンテンツ（右側） --- */}
            <div className="flex-1 h-full flex flex-col overflow-hidden">
            {/* 共通ヘッダー */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between p-4 shrink-0">
                <div className="flex gap-8">
                <button className="flex items-center gap-2 text-sm font-medium border-b-2 border-black pb-2">
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5" /> POST
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-500 pb-2">
                    <ChartBarIcon className="w-5 h-5" /> Activity
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-500 pb-2">
                    <Cog6ToothIcon className="w-5 h-5" /> Setting
                </button>
                </div>
                <Link href="/main/new_post">
                <button className="bg-green-200 hover:bg-green-300 px-6 py-2 rounded-md text-sm font-medium transition-colors">
                    New
                </button>
                </Link>
            </header>

            {/* ページごとに中身が切り替わるエリア */}
            <main className="flex-1 overflow-y-auto">
                <MainProvider userId={userId} languages={languages}>
                    {children}
                </MainProvider>
            </main>
            </div>
        </div>
    );
}