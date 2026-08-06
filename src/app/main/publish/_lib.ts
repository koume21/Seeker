import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const getPosts = async (searchKey?: string) => {
    const session = await auth();
    if(!session?.user?.id) {
        return [];
    }
    const userId = session.user.id;
    const whereClause: any = {
        isPublished:true,
    };
    if (searchKey && searchKey.trim()) {
        const words = searchKey.replace(/\s+/g, ' ').trim().split(' ');
        
        whereClause.AND = words.map((word) => ({
            OR: [
                { title: { contains: word, mode: 'insensitive' } },
                { content: { contains: word, mode: 'insensitive' } },
            ],
        }));
    }

    return await prisma.post.findMany({
        where: whereClause,
        include: {
            likes: userId ? {
                where: { userId:userId }
            } : false
        },
        orderBy: { created_at: 'desc' },
    });
}