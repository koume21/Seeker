'use client' // 💡 'use server' から 'use client' に変更

import { useActionState } from "react";
import { loginAction } from "../actions/action";
// 💡 GitHubログイン用の処理を、安全のために下にインラインではなく外出しするか、
// 別途定義したアクションを呼ぶのが一般的ですが、今回はコンポーネント内で処理を吸収します。
import { signIn } from "next-auth/react"; // 💡 クライアント側からは next-auth/react の signIn を使うか、Actionを仲介します。
import { FaGithub } from "react-icons/fa";
import Link from 'next/link';

export default function LoginPage() {
  // 💡 useActionStateを使って、prevStateをインライン関数で吸収する
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await loginAction(formData);
    },
    null
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">ログイン</h1>
        
        {/* メールアドレス・パスワードログイン */}
        {/* 💡 action にはラップされた formAction を指定 */}
        <form action={formAction} className="flex flex-col gap-4">
          
          {/* 💡 エラーメッセージがあればここに表示 */}
          {state?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input 
              name="email" 
              type="email" 
              className="w-full p-2 border rounded-md text-black" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input 
              name="password" 
              type="password" 
              className="w-full p-2 border rounded-md text-black" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="mt-4 bg-green-600 text-white p-2 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400"
          >
            {isPending ? "ログイン中..." : "ログインする"}
          </button>
        </form>

        <div className="my-6 border-t border-gray-200"></div>

        {/* GitHubログインボタン */}
        {/* 💡 クライアントコンポーネント内なので、インラインの 'use server' は削除し、
            Auth.jsが提供するクライアント用のsignIn、またはサーバーアクション経由で呼び出します */}
        <button 
          onClick={() => signIn("github", { callbackUrl: "/main/home" })}
          className="w-full bg-black text-white p-2.5 rounded-md hover:bg-gray-800 flex items-center justify-center gap-2"
        >
          <FaGithub size={20} />
          GitHubでログイン
        </button>

        {/* 新規登録画面へのリンク */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">アカウントをお持ちでないですか？ </span>
          <Link href={`/resister`} className="text-blue-600 font-semibold hover:underline">
            新規登録
          </Link>
        </div>

      </div>
    </main>
  );
}