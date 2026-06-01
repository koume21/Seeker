import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const getPosts = async ( langName?: string) => {
    const session = await auth();
    if(!session?.user?.id) {
        return [];
    }

    const userId = session.user.id;

    if(!langName) {
        return await prisma.post.findMany({
            where: {
                userId:userId,
            },
            orderBy: {created_at:'desc'},
        });
    };

    const language = await prisma.language.findUnique({
        where: {name:langName},
        select: { id:true}
    });

    if(!language) return [];

    return await prisma.post.findMany({
        where:{
            userId:userId,
            languageId:language.id,
        },
        orderBy: {created_at:'desc'}
    })
}

export const clickPlus = () => {
    console.log("クリック");
}

export const ClickNew = () => {
    console.log("Newクリック");
}