import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: '認証されていません' }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'ステータスが指定されていません' }, { status: 400 });
    }

    const { id: postId } = await params;

    const updatedPost = await prisma.post.update({
      where: { id: Number(postId) },
      data: { status: status },
    });

    return NextResponse.json({ success: true, post: updatedPost }, { status: 200 });

  } catch (error) {
    console.error('ステータス更新エラー:', error);
    return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
  }
}