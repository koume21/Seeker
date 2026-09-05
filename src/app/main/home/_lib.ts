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
    created_at: Date;
    authorName: string | null;
    authorImage: string | null;
};

export const getPosts = async ( language_name?: string,search_contents?: string,cursor?:number) => {
    const session = await auth();
    if(!session?.user?.id) {
        return { posts: [], nextCursor: null};
    }

    const userId = session.user.id;

    let languageId: number | undefined;
    if (language_name) {
        const language = await prisma.language.findUnique({
            where: { name: language_name },
            select: { id: true }
        });

        if (!language) return { posts: [], nextCursor: null}; // 存在しない言語なら空配列を返す

        languageId = language.id;
    }

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

        // 投稿者情報を表示するためUserテーブルをJOIN（曖昧回避のためPost列はpで修飾）
        pageRows = await prisma.$queryRaw<PostRow[]>`
            SELECT p.id, p.title, p.content, p.status, p.created_at,
                   u.name AS "authorName", u.image AS "authorImage"
            FROM "Post" p
            JOIN "User" u ON u.id = p."userId"
            WHERE p."userId" = ${userId}
              ${languageId ? Prisma.sql`AND p."languageId" = ${languageId}` : Prisma.empty}
              AND (
                p."search_vector" @@ websearch_to_tsquery('simple', ${search_contents})
                OR (${wordConditions})
              )
              ${cursorCreatedAt ? Prisma.sql`AND (p.created_at, p.id) < (${cursorCreatedAt}, ${cursor})` : Prisma.empty}
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT ${PAGE_SIZE + 1}
        `;
    } else {
        const whereClause: Prisma.PostWhereInput = { userId };
        if (languageId) whereClause.languageId = languageId;

        const found = await prisma.post.findMany({
            where: whereClause,
            select: {
                id: true, title: true, content: true, status: true, created_at: true,
                user: { select: { name: true, image: true } },
            },
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            take: PAGE_SIZE + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        // findManyのネストしたuserを生SQLパスと同じフラットな形へ正規化
        pageRows = found.map((p) => ({
            id: p.id, title: p.title, content: p.content, status: p.status,
            created_at: p.created_at,
            authorName: p.user?.name ?? null, authorImage: p.user?.image ?? null,
        }));
    }

    // search_psotsが11件以上の判定
    const hasMore = pageRows.length > PAGE_SIZE;

    // hasMoreがtrueの場合10件のみrowsへ保存
    const rows = hasMore ? pageRows.slice(0, PAGE_SIZE) : pageRows;

    //hasMoreがtrueの場合rowsの末尾のpost.idをnextCursorへ保存
    const nextCursor = hasMore ? rows[rows.length - 1].id : null;

    // このページ分（最大10件）のいいねだけをまとめて取得
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
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status,
        created_at: post.created_at,
        isLiked: myLikedIds.has(post.id),
        likeCount: likeCountMap.get(post.id) ?? 0, // いいね数を表示するために追加
        // 投稿者情報（アイコン・ユーザーネーム）
        author: { name: post.authorName, image: post.authorImage },
    }));

    return {posts,nextCursor}
}