import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';


export async function POST(
    request:NextRequest,
    { params }:{params:Promise<{id:string}>}
){
    try {
        // セッション情報
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
        }
        const body = await request.json();
        const {isLike,postId} = body;
        const post_id = parseInt(postId);

        if (isNaN(post_id)) {
            return NextResponse.json({ error: "不正な投稿IDです" }, { status: 400 });
        }
        const createdPost = await prisma.like.create({
                data:{
                    userId:userId,
                    postId:post_id,
                }
            });
    return NextResponse.json({ success: true, post: createdPost }, { status: 200 });
    } catch(error) {
        console.error("❌ Prismaでエラーが発生しました:", error);

        // 💡 原因究明のために、エラーメッセージをそのままフロント（ブラウザ）に返してみる
        return NextResponse.json(
            { error: "DB保存エラー", details: error instanceof Error ? error.message : String(error) },
            { status: 500 } // 400から500に変える
        );
    }
}

export async function DELETE(
    request:NextRequest,
    { params }:{params:Promise<{id:string}>}
){
    try {
        // セッション情報
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
        }
        const body = await request.json();
        const {isLike,postId} = body;
        const post_id = parseInt(postId);
        if (isNaN(post_id)) {
            return NextResponse.json({ error: "不正な投稿IDです" }, { status: 400 });
        }
        const deletepost = await prisma.like.delete({
            where:{
                userId_postId: {
                    userId:userId,
                    postId:post_id,
                }
            }
        })
        return NextResponse.json({ success: true, post: deletepost }, { status: 200 });
    } catch(error) {
        console.error("❌ Prismaでエラーが発生しました:", error);

        // 💡 原因究明のために、エラーメッセージをそのままフロント（ブラウザ）に返してみる
        return NextResponse.json(
            { error: "DB保存エラー", details: error instanceof Error ? error.message : String(error) },
            { status: 500 } // 400から500に変える
        );
    }
}