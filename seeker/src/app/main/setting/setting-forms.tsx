'use client';

import { useActionState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { updateProfile, changePassword } from './_action';
import {
  UserCircleIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface SettingFormsProps {
  name: string;
  email: string;
  image: string | null;
  hasPassword: boolean;
}

type ProfileActionState = { error?: string; success?: string; name?: string } | null;
type PasswordActionState = { error?: string; success?: string } | null;

export function SettingForms({ name, email, image, hasPassword }: SettingFormsProps) {
  const { update: updateSession } = useSession();
  const router = useRouter();

  const [profileState, profileAction, isProfilePending] = useActionState<ProfileActionState, FormData>(
    async (_prevState, formData) => updateProfile(formData),
    null
  );
  const [passwordState, passwordAction, isPasswordPending] = useActionState<PasswordActionState, FormData>(
    async (_prevState, formData) => changePassword(formData),
    null
  );

  // プロフィール更新に成功したら、JWTセッションの name も更新してサイドバー等に反映する
  useEffect(() => {
    if (profileState?.success && profileState.name) {
      updateSession({ name: profileState.name }).then(() => router.refresh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileState]);

  return (
    <div className="space-y-6">
      {/* --- プロフィール --- */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <UserCircleIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">プロフィール</h2>
            <p className="text-[11px] text-gray-400 font-medium">ユーザーネームを変更できます</p>
          </div>
        </div>

        <form action={profileAction} className="space-y-4">
          {profileState?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs font-medium flex items-center gap-1.5">
              <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
              {profileState.error}
            </div>
          )}
          {profileState?.success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-xs font-medium flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
              {profileState.success}
            </div>
          )}

          <div className="flex items-center gap-4">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                ユーザーネーム
              </label>
              <input
                name="name"
                defaultValue={name}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              メールアドレス
            </label>
            <input
              value={email}
              disabled
              className="w-full px-3 py-2 border border-gray-100 bg-gray-50 rounded-md text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isProfilePending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors disabled:bg-gray-300"
          >
            {isProfilePending ? '保存中...' : '保存する'}
          </button>
        </form>
      </section>

      {/* --- パスワード変更 --- */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <LockClosedIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">パスワード変更</h2>
            <p className="text-[11px] text-gray-400 font-medium">
              {hasPassword
                ? 'ログイン用のパスワードを変更します'
                : 'このアカウントはOAuthログインのため設定できません'}
            </p>
          </div>
        </div>

        {hasPassword ? (
          <form action={passwordAction} className="space-y-4">
            {passwordState?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs font-medium flex items-center gap-1.5">
                <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                {passwordState.error}
              </div>
            )}
            {passwordState?.success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-xs font-medium flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                {passwordState.success}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                現在のパスワード
              </label>
              <input
                type="password"
                name="currentPassword"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                新しいパスワード
              </label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isPasswordPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors disabled:bg-gray-300"
            >
              {isPasswordPending ? '更新中...' : 'パスワードを変更する'}
            </button>
          </form>
        ) : (
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-md text-xs text-gray-500">
            GitHub / Google アカウントでログインしています。
          </div>
        )}
      </section>
    </div>
  );
}
