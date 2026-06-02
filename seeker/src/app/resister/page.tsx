import { registerUser } from "../actions/action";
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">ユーザー登録</h1>
        
        {/* 以前作成したServer Actionを呼び出す */}
        <form action={registerUser} className="flex flex-col gap-4">
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
          <button 
            type="submit" 
            className="mt-4 bg-blue-600 text-white p-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            登録する
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