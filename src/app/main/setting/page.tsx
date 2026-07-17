import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SettingForms } from './setting-forms';

export default async function Setting() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, password: true },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-2 w-full">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">アカウント設定</h2>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
          プロフィールやログイン情報を管理します
        </p>
      </div>

      <SettingForms
        name={user.name ?? ''}
        email={user.email ?? ''}
        image={user.image}
        hasPassword={!!user.password}
      />
    </div>
  );
}
