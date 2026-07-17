'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

export interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface CommentNode {
  id: number;
  content: string;
  userId: string;
  postId: number;
  parentId: number | null;
  created_at: Date;
  user: CommentUser;
  replies: CommentNode[];
}

interface CommentItemProps {
  comment: CommentNode;
  currentUserId?: string;
  postOwnerId: string;
  isReply?: boolean;
  onReplySubmit: (parentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number, parentId: number | null) => Promise<void>;
}

export function CommentItem({
  comment,
  currentUserId,
  postOwnerId,
  isReply = false,
  onReplySubmit,
  onDelete,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = !!currentUserId && (comment.userId === currentUserId || postOwnerId === currentUserId);

  const handleReplySubmit = async () => {
    const trimmed = replyContent.trim();
    if (!trimmed || isSubmittingReply) return;
    setIsSubmittingReply(true);
    try {
      await onReplySubmit(comment.id, trimmed);
      setReplyContent('');
      setShowReplyForm(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = confirm('本当に削除してもよろしいですか？');
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id, comment.parentId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3">
      {comment.user.image ? (
        <img
          src={comment.user.image}
          alt={comment.user.name ?? 'user icon'}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
          {comment.user.name?.charAt(0) ?? '?'}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{comment.user.name}</span>
          <time className="text-[11px] text-slate-400 font-medium">
            {comment.created_at.toLocaleDateString('ja-JP')}
          </time>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap mt-0.5">{comment.content}</p>

        <div className="flex items-center gap-3 mt-1.5">
          {!isReply && (
            <button
              type="button"
              onClick={() => setShowReplyForm((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChatBubbleOvalLeftIcon className="w-3.5 h-3.5" />
              返信
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="削除"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              削除
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="返信を入力..."
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleReplySubmit}
              disabled={isSubmittingReply || !replyContent.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors disabled:bg-gray-300"
            >
              {isSubmittingReply ? '送信中...' : '返信する'}
            </button>
          </div>
        )}

        {!isReply && comment.replies.length > 0 && (
          <div className="mt-3 ml-2 pl-4 border-l border-slate-100 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                postOwnerId={postOwnerId}
                isReply
                onReplySubmit={onReplySubmit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
