import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request:Request) {
    try {
        const session = await auth();
        if(!session?.user?.id) {
            return NextResponse.json({error:"認証が必要です"},{status:401});
        }
        const body = await request.json();
        const { name } = body;

        if(!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json({error:"有効な言語名を入力してください"},{status:400});
        }

        const newLanguage = await prisma.language.create({
            data: { 
                name:name.trim()
            },
        });
        return NextResponse.json(newLanguage,{status:201})
    } catch(error) {
        console.error("言語の追加中にエラーが発生しました",error);
        return NextResponse.json({error:"サーバー内部のエラーが発生しました"},{status:500});
    }
}
