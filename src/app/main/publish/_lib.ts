import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';

// 一度の表示ポスト数
const PAGE_SIZE = 10;

export const getPosts = async (search_contents?: string, cursor?:number) => {
    const session = await auth();
    if(!session?.user?.id) {
        return { posts: [], nextCursor: null};
    }
    const userId = session.user.id;
    const whereClause: any = {
        isPublished:true,
    };
    if (search_contents && search_contents.trim()) {
        const words = search_contents.replace(/\s+/g, ' ').trim().split(' ');
        const wordConditions = Prisma.join(
            words.map((word) => Prisma.sql`(title ILIKE ${'%' + word + '%'} OR content ILIKE ${'%' + word + '%'})`),
            ' AND '
        );
        // 全文検索では日本語を扱うためenglishではなくsimpleを使用
        const matched = await prisma.$queryRaw<{ id: number }[]>`
            SELECT id FROM "Post"
            WHERE "isPublished" = true
              AND (
                "search_vector" @@ websearch_to_tsquery('simple', ${search_contents})
                OR (${wordConditions})
              )
        `;

        if (matched.length === 0) {
            return { posts: [], nextCursor: null };
        }
        whereClause.id = { in: matched.map((row) => row.id) };

    }
    const search_posts =  await prisma.post.findMany({
        where: whereClause,
        select: {
            id: true,
            title: true,
            content: true,
            status: true,
            userId: true,
            created_at: true,
            likes: userId ? {
                where: { userId: userId },
                select: { id: true }
            } : false
        },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        take: PAGE_SIZE + 1,
        ...(cursor ? {cursor: {id: cursor}, skip: 1}: {})
    });
    // search_psotsが11件以上の判定
    const hasMore = search_posts.length > PAGE_SIZE;

    // hasMoreがtrueの場合10件のみpageRowsへ保存
    const pageRows = hasMore ? search_posts.slice(0,PAGE_SIZE):search_posts;

    //hasMoreがtrueの場合pageRowsの末尾のpost.idをnextCursorへ保存
    const nextCursor = hasMore ? pageRows[pageRows.length - 1].id : null;

    const posts = pageRows.map((post) => ({
        ...post,
        isLiked: post.likes ? post.likes.length > 0 : false,
        likeCount: post.likes ? post.likes.length : 0
    }));

    return {posts,nextCursor}
}