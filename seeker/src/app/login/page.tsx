
import { loginAction } from "../actions/action";
import { signIn } from "@/auth"
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">ログイン</h1>
        
        <form action={loginAction} className="flex flex-col gap-4">
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
            className="mt-4 bg-green-600 text-white p-2 rounded-md font-semibold hover:bg-green-700"
          >
            ログインする
          </button>
        </form>
        <hr />
        {/* GitHubログインボタン */}
        <form action={async () => {
          "use server"
          await signIn("github", { redirectTo: "/main/home" })
        }}>
        <button type="submit" className="mt-4 w-full bg-black text-white p-2.5 rounded-md hover:bg-gray-800 flex items-center justify-center gap-2">
            <FaGithub size={20} />
            GitHubでログイン
        </button>
      </form>
      </div>
    </main>
  );
}
