import { prisma } from "@/lib/prisma";
import PostForm from "./post-form";
import { auth } from '@/auth';
import { redirect } from "next/navigation";
import { Delete } from './_action';
import { FaComment } from "react-icons/fa";
import { Trash2 } from 'lucide-react';
import DeleteButton from "./delete_button";
import { revalidatePath } from "next/cache";

interface PageProps {
    searchParams: Promise<{ edit?:string }>;
}

export default async function NewPostPage({searchParams} : PageProps) {
    const session = await auth();
    if (!session?.user?.id) return[];
    const userId = session.user.id;

    const { edit:postId } = await searchParams;
    // 編集時は付与済みラベルも取得する
    const post = postId
        ? await prisma.post.findUnique({
              where: { id: Number(postId) },
              include: { postLabels: { select: { labelId: true } } },
          })
        : null;
    if (postId && (!post || post.userId !== userId)) {
        redirect("/main/home");
    }

    // ラベルマスタ一覧（選択肢）と、編集時の付与済みラベルID
    const allLabels = await prisma.label.findMany({ orderBy: { id: "asc" } });
    const initialLabelIds = post ? post.postLabels.map((pl) => pl.labelId) : [];


    async function handlePublish(id: number | null,title: string, content: string, languageId:number, status:string,isPublished:boolean, priority:string, labelIds:number[]) {
        "use server";

        if (!title.trim() || !content.trim()){
            throw new Error("タイトルと内容は必須です");
        }

        let isSuccess = false;
        try {
            // 2. postの有無で処理を分岐
            if (id) {
                try {
                    // 投稿本体の更新とラベルの張り替えを1トランザクションで実行
                    await prisma.$transaction([
                        prisma.post.update({
                            where: { id: id },
                            data: {
                                title: title,
                                content: content,
                                languageId: languageId,
                                status: status,
                                isPublished: isPublished,
                                priority: priority,
                            },
                        }),
                        // 既存のラベル紐付けを削除して選択分を張り直す
                        prisma.postLabel.deleteMany({ where: { postId: id } }),
                        prisma.postLabel.createMany({
                            data: labelIds.map((labelId) => ({ postId: id, labelId })),
                        }),
                    ]);
                    isSuccess = true;
                } catch(error) {
                    console.error("DBupdate中にエラーが発生しました：",error);
                    throw new Error("保存に失敗しました");
                }
            } else {
                try {
                    // 投稿作成とラベル紐付けを1トランザクションで実行
                    await prisma.post.create({
                        data: {
                            title: title,
                            content: content,
                            userId: userId,
                            languageId: languageId,
                            status:status,
                            isPublished:isPublished,
                            priority: priority,
                            postLabels: {
                                create: labelIds.map((labelId) => ({ labelId })),
                            },
                        },
                    });
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
            revalidatePath("/main", "layout");
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
        <PostForm onPublish={handlePublish} post={post} allLabels={allLabels} initialLabelIds={initialLabelIds} />
        </div>
    );
}