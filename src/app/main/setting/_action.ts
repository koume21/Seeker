'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'ログインが必要です。' };
  }

  const name = (formData.get('name') as string)?.trim();
  if (!name) {
    return { error: 'ユーザーネームを入力してください。' };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  return { success: 'プロフィールを更新しました。', name };
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'ログインが必要です。' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'すべての項目を入力してください。' };
  }
  if (newPassword.length < 8) {
    return { error: '新しいパスワードは8文字以上で入力してください。' };
  }
  if (newPassword !== confirmPassword) {
    return { error: '新しいパスワードが一致しません。' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { error: 'このアカウントはパスワードログインを利用していません。' };
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { error: '現在のパスワードが正しくありません。' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: 'パスワードを変更しました。' };
}
