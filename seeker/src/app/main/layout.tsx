import { auth, signOut } from "@/auth";
import Link from "next/link";
import { prisma } from '@/lib/prisma';
import { MainProvider } from './components/user-provider';
import { HeaderNav } from './components/header-nav';
import { PlusIcon } from '@heroicons/react/24/outline';
import { 
  ChevronRightIcon, 
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const currentLang = ""; // URL等から判定する用

  // 1. カテゴリー（言語）一覧の取得
  const languages = await prisma.language.findMany({ 
    where: {
      posts: {
        some: {
          userId: userId
        }
      }
    },
  });

  // 2. 統計情報（STATS）の動的カウント取得
  // ※お使いのスキーマのフィールド名（例: status や isSolved）に合わせて条件を変更してください
  const [totalPosts, solvedPosts, unsolvedPosts] = await Promise.all([
    // 全投稿数
    prisma.post.count({
      where: { userId: userId }
    }),
    // 解決済みの投稿数 (例: status: "RESOLVED" または isSolved: true)
    prisma.post.count({
      where: { 
        userId: userId,
        status: "RESOLVED" // もし boolean なら `isSolved: true` に変更
      }
    }),
    // 未解決の投稿数 (例: status: "UNRESOLVED" または isSolved: false)
    prisma.post.count({
      where: { 
        userId: userId,
        status: "UNRESOLVED" // もし boolean なら `isSolved: false` に変更
      }
    })
  ]);

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-gray-800 antialiased">
      {/* --- 共通サイドバー --- */}
      <aside className="w-64 border-r border-gray-200 flex flex-col h-full shrink-0 bg-white justify-between">
        
        {/* 上部コンテンツエリア */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* ユーザープロフィール */}
          <div className="p-4 border-b border-gray-100">
            <Link 
              href="/main/home" 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "user icon"}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {session?.user?.name?.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-gray-900 text-sm truncate">{session?.user?.name}</span>
                <span className="text-xs text-gray-400 font-medium">Developer</span>
              </div>
            </Link>
          </div>

          {/* カテゴリーループ */}
          <div className="p-4">
            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2 px-2">
              Categories
            </p>
            <nav className="space-y-1">
              {languages.map((item) => {
                const isActive = item.name === currentLang;
                
                return (
                  <Link
                    key={item.name}
                    href={`/main/home?lang=${item.name}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                      isActive 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full transition-colors ${
                        isActive ? "bg-blue-500" : "bg-gray-300 group-hover:bg-gray-400"
                      }`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRightIcon className={`w-3.5 h-3.5 transition-colors ${
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                    }`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* STATS セクション（動的データ反映） */}
          <div className="p-4 mt-2">
            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2 px-2">
              Stats
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Total posts</span>
                <span className="font-bold text-gray-900">{totalPosts}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Solved</span>
                <span className="font-bold text-green-600">{solvedPosts}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Unsolved</span>
                <span className="font-bold text-red-500">{unsolvedPosts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ログアウトボタン */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button 
              type="submit" 
              className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors group text-left"
            >
              <ArrowRightStartOnRectangleIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              <span>ログアウト</span>
            </button>
          </form>
        </div>
      </aside>

      {/* --- メインコンテンツ --- */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 pt-4 pb-0 shrink-0">
          <HeaderNav />
          <Link href="/main/new_post" className="mb-3">
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm">
                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                <span>New</span>
          </button>
            </Link>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          <MainProvider userId={userId} languages={languages}>
            {children}
          </MainProvider>
        </main>
      </div>
    </div>
  );
}