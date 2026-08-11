import { prisma } from '@/lib/prisma';
import {searchPosts} from './_action';
import { auth } from "@/auth"
import { getPosts } from './_lib';
import { PublishPostList } from '../components/PublishPostList';

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function PublishPage({ searchParams }: PageProps) {
    //　セッション管理
    const session = await auth();
    if (!session?.user?.id) return []; 
    // 検索
    const { search } = await searchParams;
    // 公開ポストの抽出と公開の検索結果の抽出
    const { posts: publish_posts, nextCursor } = await getPosts(search);


    return (
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
          </div>
          <div>

            <form action={searchPosts} className="flex gap-2">
              <input type="text" name="query" className="border p-2 rounded" placeholder="検索ワードを入力"/>
              <button 
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                検索
              </button>
            </form>

          </div>
        </div>

        <PublishPostList
          key={`${search ?? ""}`}
          initialPosts={publish_posts}
          initialNextCursor={nextCursor}
          search={search}
          session_user={session.user.id}
        />
      </div>
    )
}