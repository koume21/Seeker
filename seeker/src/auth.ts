import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"  //github連携
import Google from "next-auth/providers/google"  //google連携
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { JWT } from "next-auth/jwt";


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
  session: { 
    strategy: "jwt",
    maxAge: 30 * 60
  },
  callbacks: {
    // ログイン後のセッションにユーザーIDを含めるための設定
    async jwt({ token, trigger,account }) {
      if(account) {
        token.provider = account.provider;
      }
      // 最初（ログイン時）に有効期限が設定されていない、または新しく設定する場合
      if (!token.exp_time) {
        // 現在時刻から30秒後のタイムスタンプを独自に保存
        token.exp_time = Math.floor(Date.now() / 1000) + 30 * 60;
      }

      // 毎回チェックを実行し、30秒を過ぎていたらトークンを意図的に無効化（過去の時間を設定）する
      const now = Math.floor(Date.now() / 1000);
      if (now > (token.exp_time as number)) {
        token.exp = now - 10; // すでに期限切れの状態にする
      } else {
        token.exp = token.exp_time as number;;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        (session.user as any).provider = token.provider as string;
      }
      return session;
    }
  },
})