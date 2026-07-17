import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { postId, content, parentId } = body;

    const post_id = parseInt(postId);
    if (isNaN(post_id)) {
      return NextResponse.json({ error: "不正な投稿IDです" }, { status: 400 });
    }

    const trimmed = typeof content === 'string' ? content.trim() : '';
    if (!trimmed) {
      return NextResponse.json({ error: "コメント内容が空です" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: post_id },
      select: { id: true, userId: true, isPublished: true },
    });

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }

    if (!post.isPublished && post.userId !== userId) {
      return NextResponse.json({ error: "この投稿にはコメントできません" }, { status: 403 });
    }

    let parent_id: number | null = null;
    if (parentId !== undefined && parentId !== null) {
      parent_id = parseInt(parentId);
      if (isNaN(parent_id)) {
        return NextResponse.json({ error: "不正な返信先です" }, { status: 400 });
      }

      const parentComment = await prisma.comment.findUnique({
        where: { id: parent_id },
        select: { id: true, postId: true, parentId: true },
      });

      if (!parentComment) {
        return NextResponse.json({ error: "返信先のコメントが見つかりません" }, { status: 404 });
      }
      if (parentComment.postId !== post_id) {
        return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
      }
      // 1階層のみ許可（返信への返信は不可）
      if (parentComment.parentId !== null) {
        return NextResponse.json({ error: "返信への返信はできません" }, { status: 400 });
      }
    }

    const created = await prisma.comment.create({
      data: {
        content: trimmed,
        userId,
        postId: post_id,
        parentId: parent_id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ success: true, comment: created }, { status: 201 });
  } catch (error) {
    console.error("❌ Prismaでエラーが発生しました:", error);
    return NextResponse.json(
      { error: "DB保存エラー", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
