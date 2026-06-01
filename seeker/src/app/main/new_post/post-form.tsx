'use client';
import { useState, useEffect } from "react";
import { useMainData } from "../components/user-provider";
import { useRouter } from "next/navigation";

interface PostFormProps {
  onPublish: (id: number | null, title: string, content: string, languageId: number) => Promise<void>;
  post: {
    id: number;
    title: string;
    content: string;
    status: string;
    languageId: number;
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
    
    await onPublish(post ? post.id : null, title, content, selectedLanguageId);
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

  const renderPreview = (text: string) => {
    const parts = text.split(/(`{3}[\s\S]*?`{3})/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeContent = part.slice(3, -3).trim();
        return (
          <div key={index} className="my-3 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md">
            <div className="flex items-center gap-1.5 bg-slate-900 px-4 py-2 border-b border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block"></span>
              <span className="text-[10px] text-slate-400 font-mono ml-2 uppercase tracking-wider">Code Box</span>
            </div>
            <pre className="p-4 text-emerald-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {codeContent || "// コードが空です"}
            </pre>
          </div>
        );
      } else {
        return (
          <span key={index} className="whitespace-pre-wrap text-slate-700 text-sm md:text-base leading-relaxed block py-1">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div className="px-4 py-8 max-w-[1400px] mx-auto w-full">
      {/* ページタイトルヘッダー */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {post ? "投稿を編集" : "新規投稿を作成"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">エラーログや解決した知見を美しくストックします。</p>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* 左側：エディタエリア */}
        <div className="flex flex-col space-y-4 lg:h-[calc(100vh-180px)] lg:min-h-[600px]">
          
          {/* 上部コントロール群 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-full sm:max-w-xs space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
              <div className="flex gap-2">
                <select 
                  value={selectedLanguageId ?? ""} 
                  onChange={(e) => setSelectedLanguageId(Number(e.target.value))} 
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-shadow shadow-sm"
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
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-all whitespace-nowrap flex items-center justify-center"
                >
                  ＋ 追加
                </button>
              </div>
            </div>
            
            <div className="flex sm:self-end w-full sm:w-auto">
              <button 
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md"
              >
                {post ? "変更" : "作成"}
              </button>
            </div>
          </div>

          {/* タイトル入力欄 */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="起きているエラー名や簡単なタイトル" 
              className="w-full px-2 py-1 text-lg font-bold focus:outline-none placeholder-slate-300 bg-transparent text-slate-900"
              required 
            />
          </div>

          {/* 本文テキストエリアコンテナ */}
          <div className="flex-1 flex flex-col relative border border-slate-200 rounded-xl shadow-inner focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span className="font-medium">Markdown サポート（コードは \`\`\` で囲む）</span>
              <button
                type="button"
                onClick={() => setContent(prev => prev + "\n\`\`\`\n\n\`\`\`")}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 font-mono text-[11px] font-bold text-slate-600 shadow-sm transition-colors"
              >
                + Code枠挿入
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="エラー文や、試したコマンドをそのまま貼り付けてください..."
              className="w-full flex-1 p-4 focus:outline-none resize-none font-mono text-sm bg-transparent text-slate-800 leading-relaxed overflow-y-auto"
            />
          </div>
        </div>

        {/* 右側：リアルタイムプレビューエリア（PCで最適化、スマホ時は下部に折りたたみ、または非表示） */}
        <div className="hidden lg:flex flex-col lg:h-[calc(100vh-180px)] lg:min-h-[600px] bg-slate-50/60 border border-slate-200 rounded-xl p-5 overflow-y-auto shadow-inner">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 pb-1 border-b border-slate-200">Real-time Preview</div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm min-h-full flex flex-col">
            <h1 className="text-xl font-extrabold text-slate-900 mb-4 whitespace-pre-wrap break-all leading-tight">
              {title || <span className="text-slate-300 italic font-normal">タイトル未入力</span>}
            </h1>
            <div className="flex-1 space-y-2">
              {content.trim() ? renderPreview(content) : <span className="text-slate-300 italic text-sm">内容を入力するとここにプレビューされます</span>}
            </div>
          </div>
        </div>

      </form>

      {/* モーダルウィンドウ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-sm mx-4 transform transition-all scale-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">新しい言語を追加</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">言語名 / 環境名</label>
                <input
                  type="text"
                  value={newLanguageName}
                  onChange={(e) => setNewLanguageName(e.target.value)}
                  placeholder="例: TypeScript, Docker, Go"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 shadow-sm"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setNewLanguageName(""); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  追加する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}