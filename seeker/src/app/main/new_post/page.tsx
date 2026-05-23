// src/app/main/new_post/page.tsx
import { prisma } from "@/lib/prisma";
import PostForm from "./post-form";
import { auth } from '@/auth';
import { redirect } from "next/navigation";

export default async function NewPostPage() {
  const session = await auth();
  if(!session?.user?.id) {
        return [];
    }

    const userId = session.user.id;

  // サーバーアクション。引数を (title: string, content: string) に変更
  async function handlePublish(title: string, content: string) {
    "use server";

    if (!title.trim() || !content.trim()){
        throw new Error("タイトルと内容は必須です");
    }

    console.log("=== サーバー側でデータを受信 ===");
    console.log("タイトル:", title);
    console.log("内容（Markdown形式）:", content);
    let isSuccess = false;
    try {
        const newPost = await prisma.post.create({
            data: {
                title: title,
                content: content,
                userId: userId,
                languageId: 3,
            },
        });
        console.log("DB保存成功:",newPost);
        isSuccess = true;
    } catch(error) {
        console.error("DB保存中にエラーが発生しました：",error);
        throw new Error("保存に失敗しました");
    }
    if (isSuccess) {
        redirect("/main/home");
    }
    // 【次のステップ】
    // フォーム側が ```` ``` ```` でコードを区別した1つの文字列をくれるので、
    // DB（Prismaなど）の `posts` テーブルの `content` カラム（text型やstring型）に
    // そのままガサッと保存するだけでOKになります！非常にシンプルです。
  }

  return (
    <div className="p-6">
      {/* 型が一致するようになり、エラーが解消されます */}
      <PostForm onPublish={handlePublish}/>
    </div>
  );
}