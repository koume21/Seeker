// 投稿カードに投稿者のアイコン・ユーザーネームを表示するコンポーネント
// アイコン未設定時はユーザーネームのイニシャルを表示し、長い名前は省略する

type AuthorInfoProps = {
  name: string | null;
  image: string | null;
};

export function AuthorInfo({ name, image }: AuthorInfoProps) {
  // 名前未設定のフォールバック
  const displayName = name && name.trim() ? name : '名無しユーザー';
  // アイコン未設定時に表示するイニシャル（先頭1文字）
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 min-w-0">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={displayName}
          className="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0"
        />
      ) : (
        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold flex items-center justify-center shrink-0">
          {initial}
        </span>
      )}
      {/* 長いユーザーネームはtruncateで省略（max-widthで折り返しも防止） */}
      <span
        className="text-xs font-semibold text-gray-700 truncate max-w-[140px]"
        title={displayName}
      >
        {displayName}
      </span>
    </div>
  );
}
