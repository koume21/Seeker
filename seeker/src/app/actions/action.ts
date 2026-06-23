'use server'

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 1. 入力値の簡易チェック
  if (!name || !email || !password) {
    return { error: "すべての項目を入力してください。" };
  }

  try {
    // 2. すでに同じメールアドレスのユーザー（GitHub等も含む）がいるかチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // 既に存在する旨をフロントに返す
      return { error: "このメールアドレスは既に登録されています。OAuthログイン（GitHubなど）をお試しください。" };
    }

    // 3. 存在しない場合のみ、新しくユーザーを作成する
    // ※注意：セキュリティのため、本来は password をハッシュ化（bcryptやargon2等）して保存することをお勧めします
    await prisma.user.create({
      data: {
        name,
        email,
        password, // ハッシュ化したパスワードを推奨
      },
    });

  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    return { error: "登録処理に失敗しました。もう一度お試しください。" };
  }

  // 4. 成功したらリダイレクト（redirectはtryブロックの外で呼ぶ必要があります）
  redirect('/main/home');
}

export async function loginAction(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", { 
      ...Object.fromEntries(formData), 
      redirectTo: "/main/home" 
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("ログイン失敗:", error.type);
      // エラータイプに応じてメッセージを出し分けると親切です
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "メールアドレスまたはパスワードが正しくありません。" };
        default:
          return { error: "ログインに失敗しました。" };
      }
    }
    // Next.js の内部的なリダイレクトエラーはそのまま throw する必要がある
    throw error;
  }
}