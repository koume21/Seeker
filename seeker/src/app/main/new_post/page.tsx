import { prisma } from "@/lib/prisma";
import PostForm from "./post-form";
import { auth } from '@/auth';
import { redirect } from "next/navigation";
import { Delete } from './_action';
import { FaComment } from "react-icons/fa";
import { Trash2 } from 'lucide-react';
import DeleteButton from "./delete_button";

interface PageProps {
    searchParams: Promise<{ edit?:string }>;
}

export default async function NewPostPage({searchParams} : PageProps) {
    const session = await auth();
    if (!session?.user?.id) return[];
    const userId = session.user.id;

    const { edit:postId } = await searchParams;
    const post = postId ? await prisma.post.findUnique({where:{id:Number(postId)}}):null;
    if (postId && (!post || post.userId !== userId)) {
        redirect("/main/home"); 
    }


    async function handlePublish(id: number | null,title: string, content: string, languageId:number, status:string,isPublished:boolean) {
        "use server";

        if (!title.trim() || !content.trim()){
            throw new Error("タイトルと内容は必須です");
        }

        let isSuccess = false;
        try {
            // 2. postの有無で処理を分岐
            if (id) {
                console.log("既存の投稿を更新します。ID:", id);
                try {
                    await prisma.post.update({
                        where: {
                            id:id,
                        },
                        data: {
                            title: title,
                            content: content,
                            languageId: languageId,
                            status:status,
                            isPublished:isPublished,
                        }
                    });
                    isSuccess = true;
                } catch(error) {
                    console.error("DBupdate中にエラーが発生しました：",error);
                    throw new Error("保存に失敗しました");
                }
            } else {
                try {
                    const newPost = await prisma.post.create({
                        data: {
                            title: title,
                            content: content,
                            userId: userId,
                            languageId: languageId,
                            status:status,
                            isPublished:isPublished,
                        },
                    });
                    console.log("DB保存成功:",newPost);
                    isSuccess = true;
                } catch(error) {
                    console.error("DB保存中にエラーが発生しました：",error);
                    throw new Error("保存に失敗しました");
                }
            }
        } catch (error) {
            console.error("送信エラー:", error);
        }
        if (isSuccess) {
            redirect("/main/home");
        }
    }
    return (
        <div className="relative p-6 bg-white rounded-xl shadow-sm">
        {/* 右上のゴミ箱ボタン */}
        {post ? (
            <DeleteButton postId={post.id} />
        ) : (
            ""
        )}

        {/* メインのフォーム */}
        <PostForm onPublish={handlePublish} post={post} />
        </div>
    );
}