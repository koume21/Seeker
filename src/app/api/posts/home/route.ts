import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPosts } from '@/app/main/home/_lib';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({error: '認証されていません'}, {status: 401})
        }

        const { searchParams } = new URL(request.url);

        const lang = searchParams.get('lang') ?? undefined;

        const search = searchParams.get('search') ?? undefined;

        const cursorParam = searchParams.get('cursor');
        
        const cursor = cursorParam ? Number(cursorParam) : undefined;

        const { posts, nextCursor } = await getPosts(lang, search, cursor);

        return NextResponse.json({posts, nextCursor}, {status: 200});
    } catch(error) {
        console.error('投稿一覧取得エラー：',error);
        return NextResponse.json({error: 'サーバー内部エラーが発生しました'}, {status:500})
        
    }
}