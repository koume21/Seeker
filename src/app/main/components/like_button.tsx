'use client';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface LikePageProps {
  postId: number;
  isLike: boolean;
  likeCount?: number;
}

export default function LikePage({ postId, isLike, likeCount = 0 }: LikePageProps) {
    const [isLiked, setIsLiked] = useState(isLike);
    const [count, setCount] = useState(likeCount);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleChange = async () => {
        if (isUpdating) return; // 連打による二重カウント防止
        const nextLikeState = !isLiked;

        // 楽観的更新：ボタン状態といいね数をリロードせず即時反映
        setIsLiked(nextLikeState);
        setCount((c) => c + (nextLikeState ? 1 : -1));
        setIsUpdating(true);

        try {
            const cleanPostId = String(postId).trim();
            const res = await fetch(`/api/likes/${cleanPostId}`, {
                method: nextLikeState ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLike: nextLikeState, postId: postId }),
            });

            if (!res.ok) {
                throw new Error('更新失敗');
            }
        } catch (error) {
            // 失敗時はボタン状態といいね数を元に戻す
            setIsLiked(isLiked);
            setCount((c) => c + (nextLikeState ? -1 : 1));
            console.error(error);
            alert('いいねの更新に失敗しました');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <button
            onClick={handleChange}
            disabled={isUpdating}
            className="p-0.5 rounded transition-colors duration-200 group focus:outline-none flex items-center gap-1 disabled:opacity-50"
            aria-label="いいね"
        >
            <Heart
                className={`w-3.5 h-3.5 transition-all duration-200
                    ${isLiked
                    ? "fill-red-500 text-red-500 scale-105"
                    : "text-gray-400 group-hover:text-red-400"
                }`}
            />
            {/* いいね数（クリック時に即時反映される） */}
            <span className="text-[11px] font-medium text-gray-500 tabular-nums">{count}</span>
        </button>
    );
}
