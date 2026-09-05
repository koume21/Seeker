'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { StatusSelect } from './StatusSelect';
import LikePage from './like_button';
import { AuthorInfo } from './AuthorInfo';
import { TagIcon, PencilIcon } from '@heroicons/react/24/outline';

type Post = {
  id: number;
  title: string;
  content: string;
  status: string;
  userId: string;
  created_at: Date;
  isLiked: boolean;
  likeCount: number;
  author: { name: string | null; image: string | null };
};

interface PublishPostListProps {
  initialPosts: Post[];
  initialNextCursor: number | null;
  search?: string;
  session_user: string;
}

export function PublishPostList({ initialPosts, initialNextCursor, search, session_user }: PublishPostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts); //Post配列
  const [nextCursor, setNextCursor] = useState<number | null>(initialNextCursor); //cursor数値
  const [hasMore, setHasMore] = useState<boolean>(initialNextCursor !== null);  //cursorが存在判定
  const [isLoading, setIsLoading] = useState(false); //loadingの可否
  const sentinelRef = useRef<HTMLDivElement>(null); // 画面下の判定要素
  const isLoadingRef = useRef(false);
  const session_user_id:string = session_user;


  const loadMore = async () => {
    if (isLoadingRef.current || !hasMore || nextCursor === null) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('cursor', String(nextCursor));

      const res = await fetch(`/api/posts/publish?${params.toString()}`);
      if (!res.ok) throw new Error('追加読み込みに失敗しました');
      const data = await res.json();

      setPosts((prev) => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
    } catch (error) {
      console.error(error);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMore) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, nextCursor, isLoading]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-xs font-semibold text-gray-600">該当する投稿がまだありません</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {posts.map((post) => {
        const formattedDate = post.created_at
          ? new Date(post.created_at).toISOString().split('T')[0]
          : "2025-06-20";
        const status_user = post.userId === session_user_id;

        return (
          <article
            key={post.id}
            className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* 投稿者情報（アイコン＋ユーザーネーム） */}
              <div className="mb-2">
                <AuthorInfo name={post.author?.name ?? null} image={post.author?.image ?? null} />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 font-medium">
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <TagIcon className="w-3.5 h-3.5" />
                  python
                </span>
                <span>·</span>
                <span>{formattedDate}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <h3 className="font-bold text-sm text-gray-900 flex-1 line-clamp-1">
                  {post.title}
                </h3>
                <div className="scale-90 transform origin-right">
                  <StatusSelect postId={post.id} initialStatus={post.status} user={status_user} />
                </div>
              </div>

              <div className="mt-2 bg-[#f8f9fa] border border-gray-200 rounded-lg px-3 py-2 font-mono text-[11px] text-gray-600 whitespace-pre-wrap break-all leading-normal">
                {post.content}
              </div>
            </div>


            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <LikePage postId={post.id} isLike={post.isLiked} likeCount={post.likeCount}/>
                    
                    <div className="flex items-center gap-4">
                        { post.userId === session_user_id &&
                            <Link 
                                href={`/main/new_post?edit=${post.id}`}
                                className="font-medium text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                                >
                                編集
                            </Link>
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
        );
      })}

      {hasMore && (
        <div ref={sentinelRef} className="py-4 text-center text-xs text-gray-400">
          {isLoading ? "読み込み中..." : ""}
        </div>
      )}
    </div>
  );
}