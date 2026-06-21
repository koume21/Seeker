import { prisma } from '@/lib/prisma';
import { auth } from "@/auth";

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DispalayHome({ params }: PageProps) {
  const { id } = await params;
  
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">投稿が見つかりませんでした</h2>
      </div>
    );
  }

  const lang = await prisma.language.findUnique({
    where: {
      id: post.languageId,
    },
  });

  // 📝 テキストからコードブロックと通常文章を切り分けるロジック
  const renderContent = (text: string) => {
    const parts = text.split(/(`{3}[\s\S]*?`{3})/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const rawCode = part.slice(3, -3).trim();
        
        const firstLineEnd = rawCode.indexOf('\n');
        let languageName = lang ? lang.name : "Code";
        let codeContent = rawCode;

        if (firstLineEnd !== -1) {
          const possibleLang = rawCode.substring(0, firstLineEnd).trim();
          if (possibleLang && !possibleLang.includes(' ') && possibleLang.length < 10) {
            languageName = possibleLang;
            codeContent = rawCode.substring(firstLineEnd + 1).trim();
          }
        }

        return (
          <div key={index} className="my-6 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 border-b border-slate-800/80 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 block"></span>
              </div>
              <span className="text-[11px] text-indigo-400 font-mono tracking-wider uppercase font-bold">
                {languageName}
              </span>
            </div>
            <pre className="p-5 text-emerald-400 font-mono text-sm overflow-x-auto whitespace-pre leading-relaxed tracking-normal bg-slate-950/40">
              <code>{codeContent || "// コードが空です"}</code>
            </pre>
          </div>
        );
      } else {
        if (!part.trim()) return null;
        
        return (
          <span key={index} className="whitespace-pre-wrap text-slate-700 text-base leading-loose block mb-4 tracking-wide">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-16">
      {/* メインカード */}
      <article className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 md:p-8">
        
        {/* メタ情報（強調された言語バッジ ＆ 日付） */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
          {/* 💡 背景を濃いインディゴ、文字を白、シャドウを追加して強調 */}
          <span className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm shadow-indigo-100 tracking-wide uppercase">
            {lang ? lang.name : "Unknown"}
          </span>
          <time dateTime={post.created_at.toISOString()} className="font-medium text-slate-500">
            {post.created_at.toLocaleDateString()}
          </time>
        </div>

        {/* 投稿タイトル（サイズを少し控えめに修正） */}
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-6 leading-snug border-b border-slate-100 pb-4">
          {post.title}
        </h1>

        {/* 投稿本文エリア */}
        <div className="mt-4">
          {renderContent(post.content)}
        </div>

      </article>
    </div>
  );
}