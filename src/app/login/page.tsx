'use client' // 💡 'use server' から 'use client' に変更

import { useActionState } from "react";
import { loginAction } from "../actions/action";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import Link from 'next/link';

export default function LoginPage() {

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

        <form action={formAction} className="flex flex-col gap-4">
          

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