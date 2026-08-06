'use client';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from "next/navigation";

interface LikePageProps {
  postId: number;
  isLike: boolean;
}

export default function LikePage({postId, isLike}: LikePageProps) {
    const [isLiked, setIsLiked] = useState(isLike);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();
    const handleChange = async() => {
        if (isUpdating) return; // 連続クリック防止
        setIsLiked(!isLiked);
        setIsUpdating(true);
        const nextLikeState = !isLiked;
        try {
            const cleanPostId = String(postId).trim();
            let res: Response | null = null;
            if(nextLikeState === true) {
                res = await fetch(`/api/likes/${cleanPostId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isLike: nextLikeState, postId: postId }),
                });
            } else {
                res = await fetch(`/api/likes/${cleanPostId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isLike: nextLikeState, postId: postId }),
                });
            }
            router.refresh();
            if (!res || !res.ok) {
                throw new Error('更新失敗');
            }
        } catch (error) {
            alert('ステータスの更新に失敗しました');
            console.error(error);
            setIsLiked(isLiked); // 失敗時は元の状態にロールバック
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        // 💡 修正：カードのフッターに美しく収まるようにパディングと高さを最小化
        <button 
           onClick={handleChange}
           disabled={isUpdating}
           className="p-0.5 rounded transition-colors duration-200 group focus:outline-none flex items-center justify-center disabled:opacity-50"
           aria-label="いいね"
        >
            {/* 💡 修正：アイコンのサイズを w-3.5 h-3.5 にし、未選択時は画像通りの薄いグレーに変更 */}
            <Heart
                className={`w-3.5 h-3.5 transition-all duration-200 
                    ${isLiked 
                    ? "fill-red-500 text-red-500 scale-105" 
                    : "text-gray-400 group-hover:text-red-400"
                }`}
            />
        </button>
    );
}