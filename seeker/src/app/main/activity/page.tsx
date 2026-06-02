import { auth } from '@/auth';
import { prisma } from "@/lib/prisma";

export default async function ActivityPage() {
    const session = await auth();
    const provider = (session?.user as any)?.provider;
    console.log('--------------------');
    console.log (provider);
    console.log('--------------------');
    return(
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-sm max-w-sm w-full">
                {/* アイコン風の装飾 */}
                <div className="inline-flex p-2.5 rounded-lg bg-indigo-50 text-indigo-600 mb-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                </div>
                
                <h3 className="text-sm font-bold text-slate-800 tracking-tight font-mono">
                    STATUS: COMING_SOON
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed font-mono">
                    // この機能は現在実装中です。<br />
                    リリースまで今しばらくお待ちください。
                </p>
            </div>
        </div>
    );
}