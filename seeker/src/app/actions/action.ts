'use server'

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation'; // 追加
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  // return newUser; ではなく、リダイレクトさせる
  redirect('/main/home'); 
}

export async function loginAction(formData: FormData) {
  try {
    //redirectToを指定することで、成功時の挙動を明示的に指定できます
    await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      // ここで return "エラー文字" とせずに、ログに留める
      console.error("ログイン失敗:", error.type);
      // もし画面にエラーを出したい場合は、後ほど useActionState という仕組みを使います
      return; 
    }
    // redirectのために必要
    throw error;
  }
}