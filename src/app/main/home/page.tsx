import { auth } from "@/auth"
import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getPosts } from './_lib';
import { StatusSelect } from '../components/StatusSelect';
import { searchPosts } from './_action';
import LikePage from '../components/like_button';
import { TagIcon, PencilIcon } from '@heroicons/react/24/outline';

interface PageProps {
  searchParams: Promise<{ lang?: string; search?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { lang, search } = await searchParams;
  const {posts, nextCursor} = await getPosts(lang, search);
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) return [];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-2 w-full">
      {/* --- ヘッダー：境界線を無くし、位置関係を右画像に調整 --- */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            {lang ? `${lang} の投稿` : "すべての投稿"}
          </h2>
        </div>
        
        {/* 検索フォームのコンパクト化と位置調整 */}
        <div>
          <form action={searchPosts} className="flex gap-1">
            <input
              type="text"
              name="query"
              className="bg-[#f3f4f6] border border-gray-200 px-3 py-1 rounded-md text-[11px] w-64 focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400" 
              placeholder="検索ワードを入力"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1 rounded-md transition-colors"
            >
              検索
            </button>
          </form>
        </div>
      </div>

      {/* --- 投稿リスト：シャープかつコンパクトに凝縮 --- */}
      {posts.length > 0 ? (
        <div className="space-y-4 w-full">
          {posts.map((post) => {
            const formattedDate = post.created_at 
              ? new Date(post.created_at).toISOString().split('T')[0] 
              : "2025-06-20";

            return (
              <article 
                key={post.id} 
                className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* カテゴリタグ & 日付 */}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 font-medium">
                    <span className="flex items-center gap-1 text-blue-600 font-semibold">
                      <TagIcon className="w-3.5 h-3.5" />
                      {/* @ts-ignore */}
                      {post.language?.name || lang || "Python"}
                    </span>
                    <span>·</span>
                    <span>{formattedDate}</span>
                  </div>

                  {/* タイトル & 右上の解決ステータス */}
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="font-bold text-sm text-gray-900 flex-1 line-clamp-1">
                      {post.title}
                    </h3>
                    <div className="scale-90 transform origin-right">
                      <StatusSelect postId={post.id} initialStatus={post.status} user={true} />
                    </div>
                  </div>

                  {/* グレーのコードブロック：パディングを極限まで詰めて右側に完全一致 */}
                  <div className="mt-2 bg-[#f8f9fa] border border-gray-200 rounded-lg px-3 py-2 font-mono text-[11px] text-gray-600 whitespace-pre-wrap break-all leading-normal">
                    {post.content}
                  </div>
                </div>

                {/* --- カードフッター：いいね数と編集の配置調整 --- */}
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  {/* いいねアイコンとカウント数を横並びに */}
                  <div className="flex items-center gap-1 text-gray-500">
                    <LikePage postId={post.id} isLike={post.isLiked}/>
                    <span className="font-medium text-[11px]">{post.likeCount || 0}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 font-medium">
                    {/* 右の画像に合わせたアイコン付き編集ボタン */}
                    <Link 
                      href={`/main/new_post?edit=${post.id}`}
                      className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      <PencilIcon className="w-3 h-3" />
                      <span>編集</span>
                    </Link>
                    
                    <Link 
                      href={`/main/display/${post.id}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-bold"
                    >
                      <span>表示</span>
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xs font-semibold text-gray-600">該当する投稿がまだありません</h3>
        </div>
      )}
    </div>
  );
}