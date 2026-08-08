import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// 一度の表示ポスト数
const PAGE_SIZE = 10;

export const getPosts = async ( language_name?: string,search_contents?: string,cursor?:number) => {
    const session = await auth();
    if(!session?.user?.id) {
        return { posts: [], nextCursor: null};
    }

    const userId = session.user.id;
    const whereClause: any = {
        userId: userId,
    };

    if (language_name) {
        const language = await prisma.language.findUnique({
            where: { name: language_name },
            select: { id: true }
        });
        
        if (!language) return { posts: [], nextCursor: null}; // 存在しない言語なら空配列を返す
        
        whereClause.languageId = language.id;
    }
    if (search_contents && search_contents.trim()) {
        const words = search_contents.replace(/\s+/g, ' ').trim().split(' ');
        
        whereClause.AND = words.map((word) => ({
            OR: [
                { title: { contains: word, mode: 'insensitive' } },
                { content: { contains: word, mode: 'insensitive' } },
            ],
        }));
    }

    const search_posts = await prisma.post.findMany({
        where: whereClause,
        select: {
            id: true,
            title: true,
            content: true,
            status: true,
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
        likeCount: post.likes ? post.likes.length : 0 // いいね数を表示するために追加
    }));

    return {posts,nextCursor}
}