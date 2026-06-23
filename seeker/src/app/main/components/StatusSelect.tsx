'use client';

import React, { useState } from 'react';

type Props = {
  postId: string | number;
  initialStatus: string;
  user : boolean
};

export function StatusSelect({ postId, initialStatus,user }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value;
    setStatus(nextStatus);
    setIsUpdating(true);

    try {
      // 404対策：確実に正しい文字列にしてリクエストを送る
      const cleanPostId = String(postId).trim();
      
      const res = await fetch(`/api/posts/${cleanPostId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error('更新失敗');
    } catch (error) {
      alert('ステータスの更新に失敗しました');
      setStatus(initialStatus); // ロールバック
    } finally {
      setIsUpdating(false);
    }
  };
  const current = status.toUpperCase();
  const isResolved = current === 'RESOLVED' || current === '解決';
  return (
    <div className="relative flex items-center">
      <div
        className={`
          relative text-xs font-bold px-3 py-1 rounded-full border transition-colors duration-200 flex items-center justify-center
          ${isResolved 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60 hover:bg-emerald-100/80' 
            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/80'
          }
          ${isUpdating ? 'opacity-50' : ''}
        `}
      >
      { user ? (
        <>
          <select
            value={status}
            onChange={handleChange}
            disabled={isUpdating}
            className="bg-transparent cursor-pointer appearance-none outline-none w-full h-full text-center pr-4 font-sans text-xs"
            style={{ color: 'inherit' }}
          >

            <option value="UNRESOLVED" className="text-slate-800 bg-white">未解決</option>
            <option value="RESOLVED" className="text-slate-800 bg-white">解決</option>
          </select>
          <span className="absolute right-2.5 pointer-events-none text-[8px] opacity-70">▼</span>
        </>
        
      ):( 
        <span className="px-1 py-0.5">
          {isResolved ? "解決" : "未解決"}
        </span>
      )}  
      </div>
    </div>
  );
}