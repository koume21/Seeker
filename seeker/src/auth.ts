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
    async jwt({ token, account, user }) {
      if(account) {
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
      }
      // 最初（ログイン時）に有効期限が設定されていない、または新しく設定する場合
      if (!token.exp_time) {
        // 現在時刻から30秒後のタイムスタンプを独自に保存
        token.exp_time = Math.floor(Date.now() / 1000) + 30 * 60;
      }
      return token;
    },
    async session({ session, token }) {
      // 💡【ここに書く！】セッションが呼ばれるたびに時間チェックを実行
      const now = Math.floor(Date.now() / 1000);
      
      if (token.exp_time && now > (token.exp_time as number)) {
        // 30分を過ぎていたら、空のオブジェクトを返して「未ログイン」状態にする
        console.log("セッションの有効期限が切れたため、ログアウトします");
        if (session.user) {
          delete (session as any).user; // userオブジェクトを完全に削除して未ログイン状態にする
        }
        return session;
      }

      // 期限内であれば、通常通りセッションにデータを詰める
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        (session.user as any).provider = token.provider as string;
      }
      
      return session;
    }
  },
})