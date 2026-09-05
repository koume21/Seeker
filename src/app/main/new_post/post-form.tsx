'use client';
import { useState, useEffect } from "react";
import { useMainData } from "../components/user-provider";
import { useRouter } from "next/navigation";
import { EyeIcon, CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import DeleteButton from './delete_button';
import LikePage from '../components/like_button';

// 優先度の選択肢（値は crisis/high/medium/low、表示は 緊急/高/中/低。デフォルトは中=medium）
const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: "crisis", label: "緊急" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

type LabelOption = { id: number; name: string };

interface PostFormProps {
  onPublish: (id: number | null, title: string, content: string, languageId: number, status: string, isPublished: boolean, priority: string, labelIds: number[]) => Promise<void>;
  onDelete?: (id: number) => Promise<void>; // 💡 削除処理用のアクション（任意で定義してください）
  post: {
    id: number;
    title: string;
    content: string;
    status: string;
    languageId: number;
    isPublished: boolean;
    priority: string;
    created_at: Date;
    updated_at: Date;
  } | null;
  allLabels: LabelOption[];      // ラベルマスタ一覧（選択肢）
  initialLabelIds: number[];     // 編集時に付与済みのラベルID
}

export default function PostForm({ onPublish, onDelete, post, allLabels, initialLabelIds }: PostFormProps) {
  const router = useRouter();
  const [isPublished, seIsPublished] = useState<boolean>(post ? post.isPublished : false)
  const { languages: initialLanguages } = useMainData();
  const [languages, setLanguages] = useState(initialLanguages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublisWindow, setPublishWindow] = useState(false);
  const [initialPublish, setinitialPublish] = useState(isPublished);
  const [newLanguageName, setNewLanguageName] = useState("");
  const [showPreview, setShowPreview] = useState<boolean>(true);

  // 優先度（デフォルトは中=medium）
  const [priority, setPriority] = useState<string>(post ? post.priority : "medium");
  // ラベル関連の状態
  const [labels, setLabels] = useState<LabelOption[]>(allLabels);              // マスタ一覧（+追加で増える）
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>(initialLabelIds); // 選択中のラベル
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");

  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
    post ? post.languageId : (languages[0]?.id ?? null)
  );
  const [title, setTitle] = useState(post ? post.title : "");
  const [status, setStatus] = useState<string>(post ? post.status : "UNRESOLVED");
  const [content, setContent] = useState(
    post 
      ? post.content 
      : ""
  );

  useEffect(() => {
    if (!selectedLanguageId && languages.length > 0) {
      setSelectedLanguageId(post ? post.languageId : languages[0].id);
    }
  }, [languages, post, selectedLanguageId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return alert("タイトルを入力してください");
    if (!content.trim()) return alert("内容を入力してください");
    if (selectedLanguageId === null) return alert("プログラミング言語を選択してください");
    if (!status) return alert("進捗を選択してください");
    
    await onPublish(post ? post.id : null, title, content, selectedLanguageId, status, initialPublish, priority, selectedLabelIds);
    setPublishWindow(false);
  };

  // ラベルチップの選択トグル
  const toggleLabel = (labelId: number) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  // 新しいラベルをマスタに追加（言語追加と同じ仕組み）し、追加後は選択状態にする
  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return alert("ラベル名を入力してください");
    try {
      const res = await fetch('/api/labels', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLabelName.trim() })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "追加に失敗しました");
      }
      const newLabel: LabelOption = await res.json();

      // 既存になければ一覧へ追加し、選択状態にする
      setLabels((prev) => (prev.some((l) => l.id === newLabel.id) ? prev : [...prev, newLabel]));
      setSelectedLabelIds((prev) => (prev.includes(newLabel.id) ? prev : [...prev, newLabel.id]));
      setNewLabelName("");
      setIsLabelModalOpen(false);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "ラベルの追加に失敗しました");
    }
  };


  const handleAddLanguage = async () => {
    if (!newLanguageName.trim()) return alert("言語名を入力してください");
    try {
      const res = await fetch('/api/languages', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
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
      console.error(error);
    }
  };

  const renderPreview = (text: string) => {
    const parts = text.split(/(`{3}[\s\S]*?`{3})/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.split("\n");
        const codeContent = lines.slice(1, -1).join("\n").trim();

        return (
          <div key={index} className="my-2 w-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#2d2d2d]">
            <div className="flex items-center gap-1 bg-[#1a1a1a] px-3 py-1.5 border-b border-[#2d2d2d]">
              <span className="w-2 h-2 rounded-full bg-[#ff5f56] block"></span>
              <span className="w-2 h-2 rounded-full bg-[#ffbd2e] block"></span>
              <span className="w-2 h-2 rounded-full bg-[#27c93f] block"></span>
              <span className="text-[9px] text-gray-500 font-mono ml-2 uppercase font-bold tracking-wider">CODE</span>
            </div>
            <pre className="p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed bg-[#1e1e1e]">
              {codeContent || "// コードが空です"}
            </pre>
          </div>
        );
      } else {
        return (
          <span key={index} className="whitespace-pre-wrap text-gray-600 text-xs leading-relaxed block py-0.5 break-all">
            {part}
          </span>
        );
      }
    });
  };

  const isResolved = status.toUpperCase() === 'RESOLVED' || status === '解決';
  const characterCount = content.length;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-[1400px] mx-auto px-4 py-2">
      
      {/* --- 1. 最上部ヘッダーエリア (ボタン・区切り線調整) --- */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-blue-500 shadow-sm">
            <PencilIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-900 leading-none">
              {post ? "投稿を編集" : "新規投稿を作成"}
            </h2>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">エラーログや解決した知見をストックします</p>
          </div>
        </div>

        {/* 右側のアクションボタン群 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-colors ${
              showPreview ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            <EyeIcon className="w-3 h-3" />
            <span>プレビュー</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/main/home")}
            className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-[11px] font-medium transition-colors"
          >
            キャンセル
          </button>
          
          <button
            type="button"
            onClick={() => setPublishWindow(true)}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <CheckIcon className="w-3 h-3 stroke-[3]" />
            <span>{post ? "保存する" : "作成する"}</span>
          </button>

          {post && (
            <>
              <div className="w-px h-4 bg-gray-200 mx-0.5" />
              <DeleteButton postId={post.id} />
            </>
          )}
        </div>
      </div>

      {/* --- 2. 言語 & ステータス コントロールバー (区切り線・＋追加ボタン調整) --- */}
      <div className="mb-4 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span>言語</span>
            <select 
              value={selectedLanguageId ?? ""} 
              onChange={(e) => setSelectedLanguageId(Number(e.target.value))} 
              className="px-1.5 py-0.5 border border-gray-200 rounded text-[11px] font-bold text-gray-700 bg-white focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            
            {/* 💡 画像に合わせた破線の「＋ 追加」ボタン */}
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)} 
              className="px-2 py-0.5 border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 bg-white rounded text-[10px] font-medium transition-colors"
            >
              ＋ 追加
            </button>
          </div>

          {/* 縦の区切り線 */}
          <div className="w-px h-3.5 bg-gray-200 mx-0.5" />

          {/* ステータスバッジ */}
          <div className={`relative px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center ${
            isResolved ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            <span className="mr-1 text-[8px]">{isResolved ? "✓" : "🕒"}</span>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent cursor-pointer appearance-none outline-none font-bold pr-3"
              style={{ color: 'inherit' }}
            >
              <option value="UNRESOLVED" className="text-gray-800 bg-white">未解決</option>
              <option value="RESOLVED" className="text-gray-800 bg-white">解決</option>
            </select>
            <span className="absolute right-2 pointer-events-none text-[6px] opacity-70">▼</span>
          </div>
        </div>

        <div className="text-gray-400 font-medium">
          {characterCount} 文字
        </div>
      </div>

      {/* --- 2.5 優先度 & ラベル --- */}
      <div className="mb-4 flex flex-col gap-2.5 text-[11px]">
        {/* 優先度：緊急/高/中/低から単一選択（デフォルト中） */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium w-10 shrink-0">優先度</span>
          <div className="flex items-center gap-1">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold transition-colors ${
                  priority === opt.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ラベル：複数選択可（任意）。＋追加でマスタに登録し選択状態にする */}
        <div className="flex items-start gap-2">
          <span className="text-gray-400 font-medium w-10 shrink-0 pt-0.5">ラベル</span>
          <div className="flex items-center flex-wrap gap-1">
            {labels.map((label) => {
              const selected = selectedLabelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors ${
                    selected
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-300'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selected ? '✓ ' : ''}{label.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsLabelModalOpen(true)}
              className="px-2 py-0.5 border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 bg-white rounded-full text-[10px] font-medium transition-colors"
            >
              ＋ 追加
            </button>
          </div>
        </div>
      </div>

      {/* --- 3. メインレイアウトグリッド --- */}
      <div className={`grid grid-cols-1 gap-5 items-stretch ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        
        {/* 左側：エディタエリア */}
        <div className="flex flex-col space-y-3">
          <div className="bg-[#f9fafb] p-3 rounded-xl border border-gray-200/70">
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">タイトル</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              placeholder="起きているエラー名や簡単なタイトル" 
              className="w-full px-1 text-sm font-bold bg-transparent text-gray-700 placeholder-gray-300 focus:outline-none"
              required 
            />
          </div>

          <div className="flex-1 flex flex-col border border-gray-200/70 rounded-xl overflow-hidden bg-white min-h-[480px]">
            <div className="bg-white px-4 py-2 border-b border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-medium">
              <span>本文 <span className="text-gray-200 mx-1">—</span> Markdown・コードは ``` で囲む</span>
              <button
                type="button"
                onClick={() => setContent(prev => prev + "\n\`\`\`\n\n\`\`\`")}
                className="text-blue-500 hover:text-blue-600 font-bold flex items-center gap-0.5"
              >
                <span>&lt;/&gt; コード挿入</span>
              </button>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="エラー文や、試したコマンドをそのまま貼り付けてください..."
              className="w-full flex-1 p-4 focus:outline-none resize-none font-mono text-xs text-gray-700 leading-relaxed overflow-y-auto"
            />

            <div className="px-4 py-1.5 border-t border-gray-100 bg-[#f9fafb] text-[9px] text-gray-400 font-mono flex gap-4">
              <span>**太字** bold</span>
              <span>`code` inline code</span>
              <span>``` ... ``` block</span>
            </div>
          </div>
        </div>

        {/* 右側：リアルタイムプレビューエリア */}
        {showPreview && (
          <div className="flex flex-col bg-gray-50/40 border border-gray-200/60 rounded-xl p-3 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 px-1 shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                リアルタイムプレビュー
              </span>
              <span className="text-[9px] text-gray-400 font-medium">入力すると表示されます</span>
            </div>
            
            <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col w-full min-w-0 overflow-y-auto">
              <div className="mb-2 text-[10px] text-gray-400 flex items-center gap-2 font-medium">
                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                  {languages.find(l => l.id === selectedLanguageId)?.name || "TypeScript"}
                </span>
                <span>2026-06-25</span>
                <span className="ml-auto text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full text-[9px]">🕒 未解決</span>
              </div>

              <h1 className="text-xs font-bold text-gray-400 mb-3 whitespace-pre-wrap break-all leading-snug">
                {title || "タイトル未入力"}
              </h1>
              
              <div className="flex-1 space-y-1 w-full min-w-0">
                {content.trim() ? renderPreview(content) : <span className="text-gray-300 italic text-[10px]">内容プレビュー</span>}
              </div>

              <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                <span>♡ 0</span>
                <div className="flex gap-2">
                  <span>編集</span>
                  <span className="text-blue-500 font-bold">表示 ＞</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* モーダルウィンドウ群 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm mx-4">
            <h3 className="text-xs font-bold text-gray-800 mb-3">新しい言語を追加</h3>
            <input type="text" value={newLanguageName} onChange={(e) => setNewLanguageName(e.target.value)} placeholder="例: TypeScript" className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs bg-white focus:outline-none" autoFocus />
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" onClick={() => { setIsModalOpen(false); setNewLanguageName(""); }} className="px-2.5 py-1 text-xs text-gray-500">キャンセル</button>
              <button type="button" onClick={handleAddLanguage} className="px-3 py-1 text-xs text-white bg-blue-500 rounded">追加</button>
            </div>
          </div>
        </div>
      )}

      {/* ラベル追加モーダル */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm mx-4">
            <h3 className="text-xs font-bold text-gray-800 mb-3">新しいラベルを追加</h3>
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLabel(); } }}
              placeholder="例: バグ"
              className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs bg-white focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" onClick={() => { setIsLabelModalOpen(false); setNewLabelName(""); }} className="px-2.5 py-1 text-xs text-gray-500">キャンセル</button>
              <button type="button" onClick={handleAddLabel} className="px-3 py-1 text-xs text-white bg-blue-500 rounded">追加</button>
            </div>
          </div>
        </div>
      )}

      {isPublisWindow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-200 p-5 w-full max-w-sm mx-4">
            <h3 className="text-xs font-bold text-gray-800 mb-4">公開設定</h3>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer bg-white ${!initialPublish ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'}`}>
                <input type="radio" name="publishSetting" checked={!initialPublish} onChange={() => setinitialPublish(false)} className="sr-only" />
                <span className="text-xs font-bold">🔒 非公開</span>
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer bg-white ${initialPublish ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'}`}>
                <input type="radio" name="publishSetting" checked={initialPublish} onChange={() => setinitialPublish(true)} className="sr-only" />
                <span className="text-xs font-bold">🌐 公開</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPublishWindow(false)} className="px-3 py-1 text-xs text-gray-400 border border-gray-100 rounded">戻る</button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <CheckIcon className="w-3 h-3 stroke-[3]" />
                  <span>{post ? "保存する" : "作成する"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}