'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommentItem, CommentNode, CommentUser } from './comment-item';

interface CommentSectionProps {
  postId: number;
  initialComments: CommentNode[];
  currentUser: CommentUser | null;
  postOwnerId: string;
}

export function CommentSection({ postId, initialComments, currentUser, postOwnerId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentNode[]>(initialComments);
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();

  const totalCount = comments.length + comments.reduce((n, c) => n + c.replies.length, 0);

  const handleNewComment = async () => {
    const trimmed = newContent.trim();
    if (!trimmed || isPosting || !currentUser) return;

    setIsPosting(true);
    const tempId = -Date.now();
    const optimistic: CommentNode = {
      id: tempId,
      content: trimmed,
      userId: currentUser.id,
      postId,
      parentId: null,
      created_at: new Date(),
      user: currentUser,
      replies: [],
    };
    setComments((prev) => [...prev, optimistic]);
    setNewContent('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: trimmed, parentId: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '投稿失敗');

      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? { ...data.comment, created_at: new Date(data.comment.created_at), replies: [] } : c))
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('コメントの投稿に失敗しました');
      setComments((prev) => prev.filter((c) => c.id !== tempId));
    } finally {
      setIsPosting(false);
    }
  };

  const handleReplySubmit = async (parentId: number, content: string) => {
    if (!currentUser) return;
    const tempId = -Date.now();
    const optimisticReply: CommentNode = {
      id: tempId,
      content,
      userId: currentUser.id,
      postId,
      parentId,
      created_at: new Date(),
      user: currentUser,
      replies: [],
    };
    setComments((prev) =>
      prev.map((c) => (c.id === parentId ? { ...c, replies: [...c.replies, optimisticReply] } : c))
    );

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content, parentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '返信失敗');

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === tempId ? { ...data.comment, created_at: new Date(data.comment.created_at), replies: [] } : r
                ),
              }
            : c
        )
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('返信の投稿に失敗しました');
      setComments((prev) =>
        prev.map((c) => (c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== tempId) } : c))
      );
      throw error;
    }
  };

  const handleDelete = async (commentId: number, parentId: number | null) => {
    const snapshot = comments;
    setComments((prev) =>
      parentId === null
        ? prev.filter((c) => c.id !== commentId)
        : prev.map((c) => (c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) } : c))
    );

    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '削除失敗');
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('コメントの削除に失敗しました');
      setComments(snapshot);
    }
  };

  return (
    <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 md:p-8 mt-8">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
        コメント（{totalCount}）
      </p>

      {currentUser && (
        <div className="flex gap-2 mb-6">
          <input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="コメントを入力..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleNewComment}
            disabled={isPosting || !newContent.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors disabled:bg-gray-300"
          >
            {isPosting ? '投稿中...' : 'コメントする'}
          </button>
        </div>
      )}

      <div className="space-y-5">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUser?.id}
            postOwnerId={postOwnerId}
            onReplySubmit={handleReplySubmit}
            onDelete={handleDelete}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-slate-400">まだコメントはありません。</p>
        )}
      </div>
    </section>
  );
}
