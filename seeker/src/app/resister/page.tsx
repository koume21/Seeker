'use client' // 💡 クライアントコンポーネントに変更

import { useActionState } from "react"; // 💡 追加
import { registerUser } from "../actions/action";
import Link from 'next/link';

export default function RegisterPage() {
  // 💡 useActionStateを使い、インライン関数でprevStateを仲介して吸収する
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await registerUser(formData);
    },
    null
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">ユーザー登録</h1>
        
        {/* 💡 action にはラップされた formAction を指定 */}
        <form action={formAction} className="flex flex-col gap-4">
          
          {/* 💡 エラーメッセージがあればここに赤枠で表示 */}
          {state?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input 
              name="name" 
              className="w-full p-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input 
              name="email" 
              type="email" 
              className="w-full p-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input 
              name="password" 
              type="password" 
              className="w-full p-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none" 
              required 
            />
          </div>
          
          {/* 💡 送信中（isPending）はボタンを無効化し、テキストを変更 */}
          <button 
            type="submit" 
            disabled={isPending}
            className="mt-4 bg-blue-600 text-white p-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isPending ? "登録中..." : "登録する"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">既にアカウントをお持ちですか？ </span>
          <Link href={`/login`} className="text-green-600 font-semibold hover:underline">
            ログイン
          </Link>
        </div>
      </div>
    </main>
  );
}