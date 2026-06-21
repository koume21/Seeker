import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. ログインチェック（セキュリティ対策）
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: '認証されていません' }, { status: 401 });
    }

    // 2. リクエストボディから新しいステータスを取り出す
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'ステータスが指定されていません' }, { status: 400 });
    }

    // 3. paramsから投稿IDを取得
    const { id: postId } = await params;

    // 4. PrismaでDBを更新
    const updatedPost = await prisma.post.update({
      where: { id: Number(postId) },
      data: { status: status },
    });

    // 5. 成功したら更新後のデータを返す
    return NextResponse.json({ success: true, post: updatedPost }, { status: 200 });

  } catch (error) {
    console.error('ステータス更新エラー:', error);
    return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
  }
}