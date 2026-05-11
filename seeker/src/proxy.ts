// src/proxy.ts
import { auth } from "@/auth"

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  console.log(req.auth);
  // 1. ログインページにいるかどうか
  const isLoginPage = nextUrl.pathname === "/login";

  // 2. ログインしていない、かつログインページ以外にアクセスしようとしたらリダイレクト
  if (!isLoggedIn && !isLoginPage) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // 3. ログイン済みでログインページにアクセスしたらトップへ戻す（任意）
  if (isLoggedIn && isLoginPage) {
    return Response.redirect(new URL("/main/home", nextUrl));
  }
})

// 適用範囲の設定（静的ファイルやAPIを除外）
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|resister).*)"],
}