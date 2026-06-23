'use client';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface LikePageProps {
  postId: number;
  isLike: boolean;
}

export default function LikePage({postId,isLike}:LikePageProps) {
    const [isLiked,setIsLiked] = useState(isLike);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleChange = async() => {
        setIsLiked(!isLiked);
        setIsUpdating(true);
        const nextLikeState = !isLiked;
        try {
            // 404対策：確実に正しい文字列にしてリクエストを送る
            const cleanPostId = String(postId).trim();
            let res: Response | null = null;
            if(nextLikeState=== true) {
                res = await fetch(`/api/likes/${cleanPostId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isLike: nextLikeState,postId:postId }),
                });
            } else if (nextLikeState === false) {
                res = await fetch(`/api/likes/${cleanPostId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isLike: nextLikeState,postId:postId }),
                });
            } else {
                res = null
            }

            if (!res || !res.ok) {
                throw new Error('更新失敗');
            }
        } catch (error) {
            alert('ステータスの更新に失敗しました');
            console.error(error)
            setIsLiked(isLiked); // ロールバック
        } finally {
            setIsUpdating(false);
        }
    }
    return (
        <button 
           onClick={handleChange}
            className="p-2 rounded-full hover:bg-red-50 transition-colors duration-200 group focus:outline-none"
            aria-label="いいね"
        >
            <Heart
                className={`w-6 h-6 transition-all duration-200 
                    ${isLiked 
                    ? "fill-red-500 text-red-500 scale-110" 
                    : "text-gray-500 group-hover:text-red-500"
                }`}
            />
        </button>
    )
}