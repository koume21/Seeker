'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';

export async function Delete(postId: number, formData?: FormData) {
    let deleteSuccess = false;
    
    try {
        await prisma.post.delete({
            where: {
                id: postId
            }
        });
        revalidatePath("/main/home");
        // 💡 削除が正常に完了したらフラグを true に
        return { success: true };
    } catch (error) {
        // 💡 本当のデータベースエラー（外部キー制約など）はここでキャッチされる
        console.error("サーバー側での削除エラー詳細:", error);
        throw new Error("データベースからの削除に失敗しました");
    }
    
    // 💡 修正：try-catchの完全に「外側」でリダイレクトを実行する
    // if (deleteSuccess) {
    //     redirect('/main/home');
    // } else {
    //     // 削除が失敗していた場合は、フロント側にエラーを投げてアラートを出す
    //     throw new Error("データベースからの削除に失敗しました");
    // }
}