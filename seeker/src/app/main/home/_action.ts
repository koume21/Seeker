"use server";
import {prisma} from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function searchPosts(formData: FormData) {
    const keyword = formData.get("query") as string;
    if(!keyword || !keyword.trim()) {
        redirect("/main/home"); 
    }
    redirect(`/main/home?search=${encodeURIComponent(keyword)}`);
}
