import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"  //github連携
import Google from "next-auth/providers/google"  //google連携
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub,
    Google,
    Credentials({
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // パスワードの照合
        if (user && user.password === password) {

          return {
            id: String(user.id), // idは文字列を期待されることが多いので念のため変換
            name: user.name,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // ログイン後のセッションにユーザーIDを含めるための設定
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
})