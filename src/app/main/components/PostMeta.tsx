// 投稿カードの優先度バッジ・ラベルchipを表示する共通コンポーネント
// home/publish両方のカードで使う（機能要件4の統合表示）

type LabelItem = { id: number; name: string };

// 優先度の値(crisis/high/medium/low)を表示ラベルと色にマッピング
const PRIORITY_MAP: Record<string, { label: string; className: string }> = {
  crisis: { label: "緊急", className: "bg-red-50 text-red-600 border-red-200" },
  high: { label: "高", className: "bg-orange-50 text-orange-600 border-orange-200" },
  medium: { label: "中", className: "bg-blue-50 text-blue-600 border-blue-200" },
  low: { label: "低", className: "bg-gray-50 text-gray-500 border-gray-200" },
};

export function PriorityBadge({ priority }: { priority: string }) {
  // 未知の値はデフォルト(中)として扱う
  const p = PRIORITY_MAP[priority] ?? PRIORITY_MAP.medium;
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${p.className}`}>
      優先度 {p.label}
    </span>
  );
}

// 優先度バッジ＋ラベルchipを1行（折り返し可）で表示。ラベルが多くても崩れないようflex-wrap
export function PostMetaRow({ priority, labels }: { priority: string; labels: LabelItem[] }) {
  return (
    <div className="flex items-center flex-wrap gap-1.5 mt-2">
      <PriorityBadge priority={priority} />
      {labels.map((label) => (
        <span
          key={label.id}
          className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-[10px] font-medium max-w-[120px] truncate"
          title={label.name}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}
