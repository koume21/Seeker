// src/proxy.ts
import { auth } from "@/auth"

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isLoginPage = nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && isLoginPage) {
    return Response.redirect(new URL("/main/home", nextUrl));
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|resister).*)"],
}