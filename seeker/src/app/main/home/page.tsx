
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

interface PageProps {
  searchParams: Promise<{ lang?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { lang } = await searchParams; // URLの?lang=... を取得
  const posts = await getPosts(lang);
  const session = await auth();
  
  // セッションがない場合は表示しない（コンポーネントの戻り値として適切なnullに修正）
  if (!session?.user?.id) return null; 
  const userId = session.user.id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
      {/* ヘッダーエリア */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 bg-clip-text text-transparent">
            {lang ? `${lang}の投稿一覧` : "すべての投稿"}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            ユーザーコミュニティから届いた最新のコンテンツをお届けします。
          </p>
        </div>
        
        {/* 言語バッジ */}
        {lang && (
          <div className="self-center md:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
              </svg>
              {lang.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* 投稿リスト（2カラムグリッド） */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="relative overflow-hidden p-4 bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* カード上部のグラデーションアクセント線 */}
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* フッター風の装飾（必要に応じて日付や投稿者などを入れてください） */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                {/* 左側：ラベル */}
                <span>ユーザー投稿</span>
                
                {/* 右側：ボタンのグループ（横並びにして、間隔を gap-4 あける） */}
                <div className="flex items-center gap-4">
                    {/* 編集ボタン */}
                    <Link 
                        href={`/main/new_post?edit=${post.id}`} // あなたのpost-formの実際のパスに書き換えてください
                        className="font-medium text-indigo-500 hover:underline cursor-pointer flex items-center gap-0.5 group/btn"
                    >
                        編集
                        <svg className="w-3 h-3 transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                    
                    {/* 表示ボタン */}
                    <Link key={post.id}
                    href={`/main/display/${post.id}`}
                    className="font-medium text-indigo-500 hover:underline cursor-pointer flex items-center gap-0.5 group/btn">
                        表示
                        <svg className="w-3 h-3 transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
                </div>
            </article>
          ))}
        </div>
      ) : (
        /* 投稿がない場合の空状態表示 */
        <div className="text-center py-20 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
          <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">該当する投稿がまだありません</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
            指定された言語のコンテンツはまだ投稿されていません。最初の投稿を作成してみませんか？
          </p>
        </div>
      )}
    </div>
  );
}