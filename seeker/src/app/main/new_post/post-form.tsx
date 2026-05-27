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
  // `languages` をローカル状態として管理できるようにフックから初期化（追加を即時反映するため）
  const { languages: initialLanguages } = useMainData();
  const [languages, setLanguages] = useState(initialLanguages);

  // モーダルの開閉状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 新しい言語の入力値
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

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("タイトルを入力してください");
    if (!content.trim()) return alert("内容を入力してください");
    if (selectedLanguageId === null) return alert("プログラミング言語を選択してください");
    
    await onPublish(post ? post.id : null, title, content, selectedLanguageId);
  };

  // 💡 新しい言語を追加する処理
  const handleAddLanguage = async () => {
    if (!newLanguageName.trim()) return alert("言語名を入力してください");
    try {

      const res = await fetch('/api/languages', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({name:newLanguageName.trim()})
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "追加に失敗しました");
      }
      const newLang = await res.json();
      
      setLanguages(prev => [...prev, newLang]);
      setSelectedLanguageId(newLang.id); // 追加した言語を自動で選択状態にする
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
          <div key={index} className="my-2 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 border-b border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-500/80 block"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500/80 block"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500/80 block"></span>
              <span className="text-[10px] text-slate-500 font-mono ml-1 uppercase">Code</span>
            </div>
            <pre className="p-3 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {codeContent || "// コードが空です"}
            </pre>
          </div>
        );
      } else {
        return (
          <span key={index} className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed block">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto relative">
      <h2 className="text-xl font-bold mb-6 text-slate-800">
        {post ? "投稿を編集" : "新規投稿を作成"}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* 左側：入力エリア */}
        <div className="space-y-4 flex flex-col h-[calc(100vh-120px)] min-h-[500px]">
          
          {/* プログラミング言語選択 ＆ 追加ボタン */}
          <div className="w-full max-w-xs space-y-2">
            <label className="block text-sm font-semibold text-gray-700">プログラミング言語</label>
            <div className="flex gap-2">
              <select 
                value={selectedLanguageId ?? ""} 
                onChange={(e) => setSelectedLanguageId(Number(e.target.value))} 
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              
              {/* 💡 「選択肢追加」をクリーンなボタンに変更 */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md border border-slate-200 transition-colors whitespace-nowrap"
              >
                ＋ 追加
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-2">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="起きているエラー名や簡単なタイトル" 
              className="w-full text-xl font-bold focus:outline-none placeholder-gray-400 bg-transparent text-slate-900"
              required 
            />
          </div>

          <div className="flex-1 flex flex-col relative border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>何件でもコピペOK（解決策は \`\`\` で囲む）</span>
              <button
                type="button"
                onClick={() => setContent(prev => prev + "\n\`\`\`\n\n\`\`\`")}
                className="px-2 py-0.5 bg-white border border-gray-200 rounded hover:bg-gray-100 font-mono text-[11px] text-slate-700"
              >
                + Code枠挿入
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="エラー文や、試したコマンドをそのまま貼り付けてください..."
              className="w-full flex-1 p-4 focus:outline-none resize-none font-mono text-sm bg-white text-gray-800 leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              {post ? "変更を保存する" : "Seekerにログをストックする"}
            </button>
          </div>
        </div>

        {/* 右側：リアルタイムプレビューエリア */}
        <div className="hidden md:flex flex-col h-[calc(100vh-120px)] min-h-[500px] bg-gray-50/50 border border-dashed border-gray-200 rounded-xl p-4 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preview</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 whitespace-pre-wrap break-all">
            {title || <span className="text-gray-300 italic">タイトル未入力</span>}
          </h2>
          <div className="flex-1 space-y-1">
            {content.trim() ? renderPreview(content) : <span className="text-gray-300 italic text-sm">内容を入力するとここにプレビューされます</span>}
          </div>
        </div>
      </form>

      {/* 💡 言語追加用の簡易モーダルウィンドウ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setNewLanguageName(""); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
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