import { prisma } from '@/lib/prisma';
import { StatusSelect } from '../components/StatusSelect';
import {searchPosts} from './_action';
import Link from 'next/link';
import { auth } from "@/auth"
import { getPosts } from './_lib';
import LikePage from '../components/like_button';

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
    const publish_post = await getPosts(search);
    const postsWithLikeStatus = publish_post.map(post => ({
        ...post,
        // @ts-ignore
        isLiked: post.likes ? post.likes.length > 0:false,
    }));


    return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      {/* --- ヘッダー：あえて大きな線を排し、洗練されたタイポグラフィと配置で魅せる --- */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
        </div>
        <div>
          {postsWithLikeStatus ? 
            <form action={searchPosts} className="flex gap-2">
              <input type="text" name="query" className="border p-2 rounded" placeholder="検索ワードを入力"/>
              <button 
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                検索
              </button>
            </form>
          : 
          ""}
        </div>
      </div>

      {/* --- 投稿リスト：背景のトーンをわずかに変化させるモダン・グリッド --- */}
      {postsWithLikeStatus.length > 0 ? (
        <div className="grid grid-cols-1 gap-7 w-full max-w-none">
          {postsWithLikeStatus.map((post) => (
            <article 
                key={post.id} 
                className="p-5 bg-slate-50/60 hover:bg-white border border-slate-200/60 hover:border-indigo-200 hover:shadow-sm transition-all duration-200 ease-out rounded-xl flex flex-col justify-between group"
                >
                <div>
                    {/* タイトルと進捗セレクトを横並び＆右上配置に */}
                    <div className="flex justify-between items-start gap-4">
                        {/* タイトル */}
                        <h3 className="font-bold text-base text-slate-800 group-hover:text-indigo-600 transition-colors duration-150 line-clamp-1 flex-1">
                            {post.title}
                        </h3>
                        <StatusSelect postId={post.id} initialStatus={post.status} user={post.userId===session?.user?.id} />
                    </div>

                    {/* コンテンツ */}
                    <p className="text-slate-500 group-hover:text-slate-600 text-xs md:text-sm mt-3 line-clamp-2 leading-relaxed transition-colors duration-150">
                    {post.content}
                    </p>
                </div>

                {/* --- カードフッター --- */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <LikePage postId={post.id} isLike={post.isLiked}/>
                    
                    <div className="flex items-center gap-4">
                        { post.userId === session?.user?.id ? 
                            <Link 
                                href={`/main/new_post?edit=${post.id}`}
                                className="font-medium text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                                >
                                編集
                            </Link>: ''
                        }
                        <Link 
                            href={`/main/display/${post.id}`}
                            className="font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-0.5"
                        >
                            <span>表示</span>
                            <svg className="w-3 h-3 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </article>
          ))}
        </div>
      ) : (
        /* --- 空状態エリア --- */
        <div className="text-center py-20 bg-slate-50/30 rounded-xl border border-slate-200/60">
          <h3 className="text-sm font-semibold text-slate-700">該当する投稿がまだありません</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
            最初のコンテンツを投稿してみましょう。
          </p>
        </div>
      )}
    </div>
    )
}