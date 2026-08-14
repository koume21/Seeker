import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';

// 一度の表示ポスト数
const PAGE_SIZE = 10;

type PostRow = {
    id: number;
    title: string;
    content: string;
    status: string;
    userId: string;
    created_at: Date;
};

export const getPosts = async (search_contents?: string, cursor?:number) => {
    const session = await auth();
    if(!session?.user?.id) {
        return { posts: [], nextCursor: null};
    }
    const userId = session.user.id;

    let pageRows: PostRow[];

    if (search_contents && search_contents.trim()) {
        let cursorCreatedAt: Date | undefined;
        if (cursor) {
            const cursorPost = await prisma.post.findUnique({ where: { id: cursor }, select: { created_at: true } });
            cursorCreatedAt = cursorPost?.created_at;
        }

        const words = search_contents.replace(/\s+/g, ' ').trim().split(' ');
        const wordConditions = Prisma.join(
            words.map((word) => Prisma.sql`(title ILIKE ${'%' + word + '%'} OR content ILIKE ${'%' + word + '%'})`),
            ' AND '
        );
        // 全文検索では日本語を扱うためenglishではなくsimpleを使用
        pageRows = await prisma.$queryRaw<PostRow[]>`
            SELECT id, title, content, status, "userId", created_at
            FROM "Post"
            WHERE "isPublished" = true
              AND (
                "search_vector" @@ websearch_to_tsquery('simple', ${search_contents})
                OR (${wordConditions})
              )
              ${cursorCreatedAt ? Prisma.sql`AND (created_at, id) < (${cursorCreatedAt}, ${cursor})` : Prisma.empty}
            ORDER BY created_at DESC, id DESC
            LIMIT ${PAGE_SIZE + 1}
        `;
    } else {
        pageRows = await prisma.post.findMany({
            where: { isPublished: true },
            select: { id: true, title: true, content: true, status: true, userId: true, created_at: true },
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            take: PAGE_SIZE + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
    }

    // search_psotsが11件以上の判定
    const hasMore = pageRows.length > PAGE_SIZE;

    // hasMoreがtrueの場合10件のみrowsへ保存
    const rows = hasMore ? pageRows.slice(0, PAGE_SIZE) : pageRows;

    //hasMoreがtrueの場合rowsの末尾のpost.idをnextCursorへ保存
    const nextCursor = hasMore ? rows[rows.length - 1].id : null;

    const rowIds = rows.map((r) => r.id);
    const [likeCounts, myLikes] = rowIds.length
        ? await Promise.all([
              prisma.like.groupBy({ by: ['postId'], where: { postId: { in: rowIds } }, _count: { id: true } }),
              prisma.like.findMany({ where: { userId, postId: { in: rowIds } }, select: { postId: true } }),
          ])
        : [[], []];
    const myLikedIds = new Set(myLikes.map((l) => l.postId));
    const likeCountMap = new Map(likeCounts.map((l) => [l.postId, l._count.id]));

    const posts = rows.map((post) => ({
        ...post,
        isLiked: myLikedIds.has(post.id),
        likeCount: likeCountMap.get(post.id) ?? 0,
    }));

    return {posts,nextCursor}
}