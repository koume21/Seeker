import { signOut,auth } from "@/auth"
import React from 'react';
import Image from "next/image";
import { 
  PlusIcon, 
  ChevronRightIcon, 
  ArrowRightStartOnRectangleIcon,
  ChatBubbleBottomCenterTextIcon, 
  ChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

export default async function MainPage() {
    const categories = ['Ruby', 'Python', 'JavaScript', 'C#', 'Go', 'HTML/CSS'];
    const session = await auth();
    console.log(session?.user?.name);
    return (
        <div className="flex h-screen bg-white text-gray-800">
            {/* --- サイドバー --- */}
            <aside className="w-64 border-r border-gray-200 flex flex-col h-full shrink-0">
                <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name ?? "user icon"}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        ) : (
                            // 画像がない場合は青色の丸を表示
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {/* 任意：名前の頭文字を入れるとそれっぽくなります */}
                            {session?.user?.name?.charAt(0)}
                        </div>
                    )}
                    <span className="font-semibold">{ session?.user?.name }</span>
                </div>

                <nav className="flex-1 overflow-y-auto p-2">
                {categories.map((item) => (
                    <div 
                    key={item} 
                    className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    >
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-gray-400"></div>
                        <span className="text-sm font-medium">{item}</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                ))}
            
                <button className="flex items-center gap-2 p-3 mt-2 text-gray-500 hover:text-gray-800 w-full">
                    <PlusIcon className="w-6 h-6" />
                </button>
                <div className="p-4 border-t border-gray-200">
                    <form
                    action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                    }}
                    >
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </form>
                </div>
                </nav>

            </aside>

            {/* --- メインコンテンツ --- */}
            <main className="flex-1 h-full overflow-y-auto">
                {/* ヘッダーナビ */}
                <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between">
                    <div className="flex gap-8">
                        <button className="flex items-center gap-2 text-sm font-medium border-b-2 border-black pb-4 -mb-[18px]">
                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5" /> POST
                        </button>
                        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 pb-4">
                        <ChartBarIcon className="w-5 h-5" /> Activity
                        </button>
                        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 pb-4">
                        <Cog6ToothIcon className="w-5 h-5" /> Setting
                        </button>
                    </div>
                    <button className="bg-green-200 hover:bg-green-300 px-6 py-2 rounded-md text-sm font-medium transition-colors">
                        New
                    </button>
                </header>
                <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
                    {/* フォームエリア */}
                    <section className="p-8 max-w-4xl w-full mx-auto space-y-6">
                        <div>
                            <textarea 
                            className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32"
                            placeholder="rubyのエラーコード"
                            />
                        </div>

                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Label</label>
                            <textarea 
                                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                                placeholder="Value"
                            />
                            </div>
                        ))}
                    </section>
                </div>
            </main>
        </div>
    );
}


