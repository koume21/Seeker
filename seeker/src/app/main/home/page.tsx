
import { auth } from "@/auth"
import React from 'react';
import Image from "next/image";
import {prisma} from '@/lib/prisma';
import Link from 'next/link';

import { getPosts } from './_lib';

import { 
  PlusIcon, 
  ChevronRightIcon, 
  ArrowRightStartOnRectangleIcon,
  ChatBubbleBottomCenterTextIcon, 
  ChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

// type Props = {
//     searchParams:Promise<{lang?:string}>
// }

// export default async function MainPage({searchParams}:Props) {


//     const session = await auth();
    
//     if (!session?.user?.id) return[];

//     const userId = session.user.id;
//     const language = await prisma.language.findMany(
//         { 
//             where: {
//                 posts: {
//                     some: {
//                         userId:userId
//                     }
//                 }
//             },
//             select: {name:true}
//         }
//     );
//     const {lang} = await searchParams;
    
//     const posts = await getPosts(lang);
//     console.log(language);
//     console.log('----------------------------');
//     console.log({lang});
//     console.log('----------------------------');
//     return (
//         <div className="flex h-screen bg-white text-gray-800">
//             {/* --- サイドバー --- */}
//             <aside className="w-64 border-r border-gray-200 flex flex-col h-full shrink-0">
//                 <div className="p-4 border-b border-gray-200 flex items-center gap-2">
//                     {session?.user?.image ? (
//                         <img
//                             src={session.user.image}
//                             alt={session.user.name ?? "user icon"}
//                             className="w-8 h-8 rounded-full object-cover"
//                         />
//                         ) : (
//                             // 画像がない場合は青色の丸を表示
//                             <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
//                             {/* 任意：名前の頭文字を入れるとそれっぽくなります */}
//                             {session?.user?.name?.charAt(0)}
//                         </div>
//                     )}
//                     <span className="font-semibold">{ session?.user?.name }</span>
//                 </div>
//                 {/* 言語名表示 */}
//                 <nav className="flex-1 overflow-y-auto p-2">
//                     {language.map((item) => (
//                         <Link 
//                             key={item.name} 
//                             href={`/main/home?lang=${item.name}`}
//                             className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group"
//                             >
//                             <div className="flex items-center gap-3">
//                                 {/* チェックボックス風の円 */}
//                                 <div className="w-5 h-5 rounded-full border border-gray-400 group-hover:border-blue-500 transition-colors"></div>
                                
//                                 <span className="font-medium text-gray-700">
//                                 {item.name}
//                                 </span>
//                             </div>

//                             <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />

//                         </Link>
//                     ))}
//                     {/* 言語プラスボタン */}
//                     <div>
//                         <form
//                             action={async () => {
//                                 "use server";
//                                 clickPlus()
//                             }}
//                         >
//                             <button className="group flex items-center gap-2 p-3 mt-2 text-gray-500 hover:text-gray-800 w-full">
//                                 <span className="p-1 rounded-full transition-colors duration-200 group-hover:bg-gray-100">
//                                     <PlusIcon className="w-6 h-6" />
//                                 </span>
//                             </button>
//                         </form>
//                     </div>
//                     <div className="p-4 border-t border-gray-200">
//                         <form
//                         action={async () => {
//                         "use server";
//                         await signOut({ redirectTo: "/login" });
//                         }}
//                         >
//                             <button className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-gray-500" />
//                             </button>
//                         </form>
//                     </div>
//                 </nav>

//             </aside>

//             {/* --- メインコンテンツ --- */}
//             <main className="flex-1 h-full overflow-y-auto">
//                 {/* ヘッダーナビ */}
//                 <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between">
//                     <div className="flex gap-8">
//                         <button className="flex items-center gap-2 text-sm font-medium border-b-2 border-black pb-4 -mb-[18px]">
//                         <ChatBubbleBottomCenterTextIcon className="w-5 h-5" /> POST
//                         </button>
//                         <button className="flex items-center gap-2 text-sm font-medium text-gray-500 pb-4">
//                         <ChartBarIcon className="w-5 h-5" /> Activity
//                         </button>
//                         <button className="flex items-center gap-2 text-sm font-medium text-gray-500 pb-4">
//                         <Cog6ToothIcon className="w-5 h-5" /> Setting
//                         </button>
//                     </div>
//                     <Link href="/main/new_post" className="group flex items-center gap-2 p-3 mt-2 text-gray-500 hover:text-gray-800 w-full">
//                         <button className="bg-green-200 hover:bg-green-300 px-6 py-2 rounded-md text-sm font-medium transition-colors">
//                             New
//                         </button>
//                     </Link>
//                 </header>
//                 <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
//                     {/* フォームエリア */}
//                     <h2 className="text-xl font-bold mb-4">
//                         {lang ? `${lang}の投稿一覧`:"すべての投稿"}
//                     </h2>
//                     <div className="space-y-4">
//                         {posts.length > 0 ? (
//                         posts.map((post) => (
//                             <div key={post.id} className="p-4 border rounded shadow-sm">
//                             <h3 className="font-bold">{post.title}</h3>
//                             <p className="text-gray-600">{post.content}</p>
//                             <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                                 {post.content}
//                             </span>
//                             </div>
//                         ))
//                         ) : (
//                         <p className="text-gray-500">該当する投稿はありません。</p>
//                         )}
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }




interface PageProps {
  searchParams:Promise<{lang?:string}>
}

export default async function HomePage({ searchParams }: PageProps) {
    const { lang } = await searchParams; // URLの?lang=... を取得
    const posts = await getPosts(lang);
    const session = await auth();
    if (!session?.user?.id) return[];
    const userId = session.user.id;


    return (
        <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
            <h2 className="text-xl font-bold mb-4">
            {lang ? `${lang}の投稿一覧` : "すべての投稿"}
            </h2>
            <div className="space-y-4">
            {posts.length > 0 ? (
                posts.map((post) => (
                <div key={post.id} className="p-4 border rounded shadow-sm">
                    <h3 className="font-bold">{post.title}</h3>
                    <p className="text-gray-600">{post.content}</p>
                </div>
                ))
            ) : (
                <p className="text-gray-500">該当する投稿はありません。</p>
            )}
            </div>
        </div>
    );
}


