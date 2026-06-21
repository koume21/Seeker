// src/app/main/new_post/delete-button.tsx
"use client"; // 💡 これを宣言することで、ブラウザ側の処理（confirm）が自由に使えるようになります

import { Trash2 } from "lucide-react";
import { Delete } from "./_action";

interface DeleteButtonProps {
  postId: number;
}

export default function DeleteButton({ postId }: DeleteButtonProps) {
  
  const handleDelete = async (e: React.FormEvent) => {
    // 1. 確認ダイアログを出す
    const isConfirmed = confirm("本当に削除してもよろしいですか？");
    
    // 2. キャンセルされたら、フォームの送信（削除実行）を阻止する！
    if (!isConfirmed) {
      e.preventDefault();
    }
  };

  return (
    // 💡 クライアントコンポーネント内なので、onSubmit も action も安全に動きます
    <form 
      action={Delete.bind(null, postId)} 
      onSubmit={handleDelete} 
      className="!absolute !top-4 !right-4 z-50"
    >
      <button
        type="submit"
        aria-label="削除"
        className="p-2 rounded-lg transition-colors hover:bg-red-50 focus:outline-none"
      >
        <Trash2 className="h-5 w-5 !text-red-600 hover:text-red-700" color="#d67272" />
      </button>
    </form>
  );
}