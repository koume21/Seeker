import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ラベルマスタ一覧を取得（new/edit画面の選択肢用）
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }
        const labels = await prisma.label.findMany({
            orderBy: { id: "asc" },
        });
        return NextResponse.json(labels, { status: 200 });
    } catch (error) {
        console.error("ラベル一覧の取得中にエラーが発生しました", error);
        return NextResponse.json({ error: "サーバー内部のエラーが発生しました" }, { status: 500 });
    }
}

// 新しいラベルをマスタに追加（言語追加と同じ仕組み）
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json({ error: "有効なラベル名を入力してください" }, { status: 400 });
        }

        const trimmed = name.trim();

        // 同名ラベルがあれば既存を返す（重複登録を防止）
        const existing = await prisma.label.findFirst({ where: { name: trimmed } });
        if (existing) {
            return NextResponse.json(existing, { status: 200 });
        }

        const newLabel = await prisma.label.create({
            data: { name: trimmed },
        });
        return NextResponse.json(newLabel, { status: 201 });
    } catch (error) {
        console.error("ラベルの追加中にエラーが発生しました", error);
        return NextResponse.json({ error: "サーバー内部のエラーが発生しました" }, { status: 500 });
    }
}
