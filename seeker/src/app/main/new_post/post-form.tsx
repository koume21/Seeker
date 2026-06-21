'use client';
import { useState, useEffect } from "react";
import { useMainData } from "../components/user-provider";
import { useRouter } from "next/navigation";
// import CodeBlock  from "../components/CodeBlock";

interface PostFormProps {
  onPublish: (id: number | null, title: string, content: string, languageId: number, status:string) => Promise<void>;
  post: {
    id: number;
    title: string;
    content: string;
    status: string;
    languageId: number;
    isPublished: boolean;
    created_at: Date;
    updated_at: Date;
  } | null;
}

export default function PostForm({ onPublish, post }: PostFormProps) {
  const router = useRouter();
  const { languages: initialLanguages } = useMainData();
  const [languages, setLanguages] = useState(initialLanguages);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLanguageName, setNewLanguageName] = useState("");

  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
    post ? post.languageId : (languages[0]?.id ?? null)
  );

  const [title, setTitle] = useState(post ? post.title : "");



  const [status, setStatus] = useState<string>(post ? post.status : "UNRESOLVED");
  const [content, setContent] = useState(
    post 
      ? post.content 
      : `// 【ここにエラー文やコマンドをガサッとコピペ！】
An error occurred...

// 【解決策はバッククォート3つで囲むとコードっぽくなります】
\`\`\`
npm run dev
\`\`\``
  );

  useEffect(() => {
    if (!selectedLanguageId && languages.length > 0) {
      setSelectedLanguageId(post ? post.languageId : languages[0].id);
    }
  }, [languages, post, selectedLanguageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("タイトルを入力してください");
    if (!content.trim()) return alert("内容を入力してください");
    if (selectedLanguageId === null) return alert("プログラミング言語を選択してください");
    if (!status) return alert("進捗を選択してください");
    await onPublish(post ? post.id : null, title, content, selectedLanguageId,status);
  };

  const handleAddLanguage = async () => {
    if (!newLanguageName.trim()) return alert("言語名を入力してください");
    try {
      const res = await fetch('/api/languages', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newLanguageName.trim() })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "追加に失敗しました");
      }
      const newLang = await res.json();
      
      setLanguages(prev => [...prev, newLang]);
      setSelectedLanguageId(newLang.id);
      setNewLanguageName("");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("【フロントエンドエラー詳細】:", error);
      alert("追加に失敗しました");
    }
  };

  // プレビューレンダラー（突き抜け防止対応）
  const renderPreview = (text: string) => {
    const parts = text.split(/(`{3}[\s\S]*?`{3})/g);
    const found = languages.find(item=>item.id===selectedLanguageId)
    const lang_Name = found?.name ?? "";
    console.log(lang_Name);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeContent = part.slice(3, -3).trim();
        
        return (
           <div key={index} className="my-3 w-full min-w-0 bg-slate-950 rounded-xl overflow-hidden border border-slate-900 shadow-sm">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-4 py-2 border-b border-slate-900">
              <span className="w-2 h-2 rounded-full bg-rose-500/70 block"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500/70 block"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500/70 block"></span>
              <span className="text-[10px] text-slate-500 font-mono ml-2 uppercase tracking-wider font-semibold">Code Box</span>
            </div>
            {/* overflow-x-auto で長い1行があってもコンテナ内でスクロール可能に */}
            <pre className="p-4 text-emerald-400 font-mono text-xs md:text-sm overflow-x-auto whitespace-pre-wrap break-all leading-relaxed bg-slate-950">
              {codeContent || "// コードが空です"}
            </pre>
          </div>
        );
      } else {
        return (
          <span key={index} className="whitespace-pre-wrap text-slate-600 text-xs md:text-sm leading-relaxed block py-1 break-all">
            {part}
          </span>
        );
      }
    });
  };
  const isResolved = status.toUpperCase() === 'RESOLVED' || status === '解決';
  // 公開・非公開
  const [isPublished,seIsPublished] = useState<boolean>(post?post.isPublished:false)
  console.log(isPublished);
  return (
    <form onSubmit={handleSubmit} className="px-6 pt-4 py-10 max-w-[1400px] mx-auto w-full">
      

      <div className="mb-8 pb-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {post ? "投稿を編集" : "新規投稿を作成"}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">エラーログや解決した知見を美しくストックします。</p>
        </div>

        <button 
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold text-xs tracking-wide transition-colors shadow-sm whitespace-nowrap"
        >
          {post ? "保存" : "作成"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* --- 左側：エディタエリア --- */}
        <div className="flex flex-col space-y-4 lg:h-[calc(100vh-220px)] lg:min-h-[600px]">
          
          {/* 上部コントロール群（ボタンを抜いたため、シンプルな幅に自動調整されます） */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
            <div className="w-full sm:max-w-xs space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</label>
              <div className="flex gap-2">
                <select 
                  value={selectedLanguageId ?? ""} 
                  onChange={(e) => setSelectedLanguageId(Number(e.target.value))} 
                  className="flex-1 px-3 py-2 border border-slate-200/80 rounded-lg bg-white text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 shadow-sm transition-colors"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200/80 shadow-sm transition-colors whitespace-nowrap"
                >
                  ＋ 追加
                </button>
                <div
                  className={`
                    relative text-xs font-bold px-3 py-2 rounded-full border transition-colors duration-200 flex items-center justify-center shrink-0
                    ${isResolved 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60 hover:bg-emerald-100/80' 
                      : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/80'
                    }
                  `}
                >
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-transparent cursor-pointer appearance-none outline-none w-full h-full text-center pr-3 font-sans text-xs font-bold"
                    style={{ color: 'inherit' }}
                  >
                    <option value="UNRESOLVED" className="text-slate-800 bg-white">未解決</option>
                    <option value="RESOLVED" className="text-slate-800 bg-white">解決</option>
                  </select>
                  <span className="absolute right-2 pointer-events-none text-[8px] opacity-70">▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* タイトル入力欄 */}
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 focus-within:border-indigo-400 transition-colors">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="起きているエラー名や簡単なタイトル" 
              className="w-full px-2 py-1 text-base font-bold focus:outline-none placeholder-slate-300 bg-transparent text-slate-800"
              required 
            />
          </div>

          {/* 本文テキストエリア */}
          <div className="flex-1 flex flex-col relative border border-slate-200/80 rounded-xl focus-within:border-indigo-400 overflow-hidden bg-white">
            <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-200/60 flex justify-between items-center text-[11px] text-slate-400 font-medium">
              <span>Markdown サポート（コードは \`\`\` で囲む）</span>
              <button
                type="button"
                onClick={() => setContent(prev => prev + "\n\`\`\`\n\n\`\`\`")}
                className="px-2 py-1 bg-white border border-slate-200/80 rounded hover:bg-slate-50 font-mono text-[10px] font-bold text-slate-500 transition-colors"
              >
                + Code枠挿入
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="エラー文や、試したコマンドをそのまま貼り付けてください..."
              className="w-full flex-1 p-4 focus:outline-none resize-none font-mono text-xs md:text-sm bg-transparent text-slate-700 leading-relaxed overflow-y-auto"
            />
          </div>
        </div>

        {/* --- 右側：リアルタイムプレビューエリア --- */}
        <div className="hidden lg:flex flex-col lg:h-[calc(100vh-220px)] lg:min-h-[600px] bg-slate-50/40 border border-slate-100 rounded-xl p-5 min-w-0 overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 shrink-0">
            Real-time Preview
          </div>
          
          <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm flex flex-col w-full min-w-0 overflow-y-auto">
            <h1 className="text-lg font-bold text-slate-800 mb-4 whitespace-pre-wrap break-all leading-snug shrink-0">
              {title || <span className="text-slate-300 italic font-normal">タイトル未入力</span>}
            </h1>
            <div className="flex-1 space-y-2 w-full min-w-0">
              {content.trim() ? renderPreview(content) : <span className="text-slate-300 italic text-xs">内容を入力するとここにプレビューされます</span>}
            </div>
          </div>
        </div>

      </div>

      {/* モーダルウィンドウ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm mx-4 shadow-md">
            <h3 className="text-sm font-bold text-slate-800 mb-4">新しい言語を追加</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">言語名 / 環境名</label>
                <input
                  type="text"
                  value={newLanguageName}
                  onChange={(e) => setNewLanguageName(e.target.value)}
                  placeholder="例: TypeScript, Docker, Go"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setNewLanguageName(""); }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  追加する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}