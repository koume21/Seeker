import { signOut } from "@/auth" // 自分で作ったauth.tsからインポート

export default function UserMenu() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({ redirectTo: "/login" })
      }}
    >
      <button type="submit" className="mt-4 bg-blue-600 text-white p-2 rounded-md font-semibold hover:bg-blue-700 transition">ログアウト</button>
    </form>
  )
}