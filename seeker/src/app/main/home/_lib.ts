import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const getPosts = async ( langName?: string,searchKey?: string) => {
    const session = await auth();
    if(!session?.user?.id) {
        return [];
    }

    const userId = session.user.id;
    const whereClause: any = {
        userId: userId,
    };

    if (langName) {
        const language = await prisma.language.findUnique({
            where: { name: langName },
            select: { id: true }
        });
        
        if (!language) return []; // 存在しない言語なら空配列を返す
        
        whereClause.languageId = language.id;
    }

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
        orderBy: { created_at: 'desc' },
    });
}

export const clickPlus = () => {
    console.log("クリック");
}

export const ClickNew = () => {
    console.log("Newクリック");
}