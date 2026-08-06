import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { id } = await params;
    const comment_id = parseInt(id);
    if (isNaN(comment_id)) {
      return NextResponse.json({ error: "不正なコメントIDです" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: comment_id },
      select: {
        id: true,
        userId: true,
        parentId: true,
        post: { select: { userId: true } },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "コメントが見つかりません" }, { status: 404 });
    }

    const isAuthor = comment.userId === userId;
    const isPostOwner = comment.post.userId === userId;
    if (!isAuthor && !isPostOwner) {
      return NextResponse.json({ error: "削除する権限がありません" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: comment_id } });

    return NextResponse.json(
      { success: true, id: comment_id, parentId: comment.parentId },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Prismaでエラーが発生しました:", error);
    return NextResponse.json(
      { error: "DB保存エラー", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
