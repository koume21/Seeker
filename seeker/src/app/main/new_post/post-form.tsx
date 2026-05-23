'use client';

import { useState } from "react";

interface PostFormProps {
  onPublish: (title: string, content: string) => Promise<void>;
}

export default function PostForm({ onPublish }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(`// 【ここにエラー文やコマンドをガサッとコピペ！】
        An error occurred...

        // 【解決策はバッククォート3つで囲むとコードっぽくなります】
        \`\`\`
        npm run dev
        \`\`\``);

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("タイトルを入力してください");
    if (!content.trim()) return alert("内容を入力してください");
    await onPublish(title, content);
  };

  // 簡易プレビュー用に、テキストをコード部分と通常部分に分解する関数
  const renderPreview = (text: string) => {
    const parts = text.split(/(`{3}[\s\S]*?`{3})/g);
    console.log(parts);
    return parts.map((part, index) => {
        console.log(part);
        console.log(index);
      if (part.startsWith("```") && part.endsWith("```")) {
        // コードブロック部分（``` を削って中身だけ表示）
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
        // 通常の文章部分
        return (
          <span key={index} className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed block">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 左側：入力エリア（圧倒的な手軽さ） */}
        <div className="space-y-4 flex flex-col h-[calc(100vh-120px)] min-h-[500px]">
          <div className="border-b border-gray-200 pb-2">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="起きているエラー名や簡単なタイトル" 
              className="w-full text-xl font-bold focus:outline-none placeholder-gray-400"
              required 
            />
          </div>

          <div className="flex-1 flex flex-col relative border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>何件でもコピペOK（解決策は \`\`\` で囲む）</span>
              <button
                type="button"
                onClick={() => setContent(prev => prev + "\n\`\`\`\n\n\`\`\`")}
                className="px-2 py-0.5 bg-white border border-gray-200 rounded hover:bg-gray-100 font-mono text-[11px]"
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
              Seekerにログをストックする
            </button>
          </div>
        </div>

        {/* 右側：リアルタイムプレビューエリア（自動でコードを判別して綺麗に見せる） */}
        <div className="hidden md:flex flex-col h-[calc(100vh-120px)] min-h-[500px] bg-gray-50/50 border border-dashed border-gray-200 rounded-xl p-4 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preview</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {title || <span className="text-gray-300 italic">タイトル未入力</span>}
          </h2>
          <div className="flex-1 space-y-1">
            {content.trim() ? renderPreview(content) : <span className="text-gray-300 italic text-sm">内容を入力するとここにプレビューされます</span>}
          </div>
        </div>

      </form>
    </div>
  );
}