import { auth } from '@/auth';
import { prisma } from "@/lib/prisma";
export default async function Setting() {
    const session = await auth();
    const provider = (session?.user as any)?.provider;
    console.log('--------------------');
    console.log (provider);
    console.log('--------------------');
    return(


        <div>
            パスワードを変更したい方
        </div>
    );
}