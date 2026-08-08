import { auth } from "@/auth"
import React from 'react';
import { prisma } from '@/lib/prisma';
import { getPosts } from './_lib';
import { searchPosts } from './_action';
import { HomePostList } from '../components/HomePostList';

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

      <div className="mb-4 flex items-center justify-between gap-4">

        <div>
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            {lang ? `${lang} の投稿` : "すべての投稿"}
          </h2>
        </div>
        
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

      <HomePostList
        key={`${lang ?? ""}-${search ?? ""}`}
        initialPosts={posts}
        initialNextCursor={nextCursor}
        lang={lang}
        search={search}
      />

    </div>
  );
}