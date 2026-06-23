'use server';
import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation';
export async function Delete(post:number,formData:FormData) {

    const post_id = post;
    let deleteSuccess = true;
    try {
        await prisma.post.delete({
            where: {
                id:post
            }
        });
    } catch (error) {
        console.error(error);
        deleteSuccess = false;
    }
    if (deleteSuccess) {
        redirect('/main/home');
    }
}