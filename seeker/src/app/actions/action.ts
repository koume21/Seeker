'use server'

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// 引数から prevState を削除！
export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: "すべての項目を入力してください。" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "このメールアドレスは既に登録されています。OAuthログイン（GitHubなど）をお試しください。" };
    }

    // 1. データベースにユーザーを作成
    await prisma.user.create({
      data: { name, email, password },
    });

    // 💡 2.【重要】作成したアカウントでそのまま自動ログインを実行する
    // これにより jwt コールバックが走り、token.exp_time が正しくセットされます
    await signIn("credentials", {
      email,
      password,
      redirect: false, // ここでの自動リダイレクトはオフにする
    });

  } catch (error) {
    if (error instanceof AuthError) {
      console.error("サインアップ後の自動ログイン失敗:", error.type);
      return { error: "アカウントは作成されましたが、自動ログインに失敗しました。ログイン画面からログインしてください。" };
    }
    console.error("ユーザー登録エラー:", error);
    return { error: "登録処理に失敗しました。もう一度お試しください。" };
  }

  // 3. セッションが確立された状態でホームへリダイレクト
  redirect('/main/home');
}

// 引数から prevState を削除！
export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", { 
      ...Object.fromEntries(formData), 
      redirectTo: "/main/home" 
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("ログイン失敗:", error.type);
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "メールアドレスまたはパスワードが正しくありません。" };
        default:
          return { error: "ログインに失敗しました。" };
      }
    }
    throw error;
  }
}