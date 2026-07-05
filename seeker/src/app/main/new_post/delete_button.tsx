"use client";

import { Trash2 } from "lucide-react";
import { Delete } from "./_action";
import { useRouter } from "next/navigation";
import { redirect } from 'next/navigation';

interface DeleteButtonProps {
  postId: number;
}

export default function DeleteButton({ postId }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const isConfirmed = confirm("本当に削除してもよろしいですか？");
    if (!isConfirmed) return; // キャンセルなら何もしない

    try {
      // 2. Server Actionを直接関数として呼び出す
      const result = await Delete(postId);
      
     if (result && result.success) {
        console.log('削除成功');
        window.location.href = "/main/home";
      }
    } catch (error) {
      console.error("削除に失敗しました:", error);
      alert("削除に失敗しました。");
    }
  };

  return (
    // 💡 フォームの入れ子を防ぐため、formタグから単なる div やフラグメントに変更
    <div className="inline-block">
      <button
        type="button" // 💡 submit ではなく、単なるボタンとして動作させる
        onClick={handleDelete}
        aria-label="削除"
        className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-md transition-colors shadow-sm flex items-center justify-center focus:outline-none"
      >
        <Trash2 className="h-3.5 w-3.5 text-red-500 hover:text-red-600" />
      </button>
    </div>
  );
}