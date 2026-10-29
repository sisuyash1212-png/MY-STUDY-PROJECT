import React, { useState } from 'react';
import { StudyNote } from '../types';
import { AvatarIcon } from './AvatarPicker';
import { useAuth } from '../context/AuthContext';
import { X, Heart, Bookmark, MessageSquare, Trash2, Edit3, Send, Calendar, Clock, Lock, Users, Globe } from 'lucide-react';

interface NoteReaderModalProps {
  note: StudyNote | null;
  onClose: () => void;
  onLike: (noteId: string) => Promise<void>;
  onBookmark: (noteId: string) => Promise<void>;
  onAddComment: (noteId: string, text: string) => Promise<void>;
  onEdit?: (note: StudyNote) => void;
  onDelete?: (noteId: string) => Promise<void>;
}

export const NoteReaderModal: React.FC<NoteReaderModalProps> = ({
  note,
  onClose,
  onLike,
  onBookmark,
  onAddComment,
  onEdit,
  onDelete,
}) => {
  if (!note) return null;

  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAuthor = user && user.id === note.authorId;
  const isLiked = user && note.likes?.includes(user.id);
  const isBookmarked = user && note.bookmarks?.includes(user.id);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await onAddComment(note.id, commentText.trim());
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete(note.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-cyan-950/30 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-900 bg-slate-900/60 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                CH #{note.chapterId} {note.chapterName}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                {note.topic}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-400 border border-slate-800 flex items-center gap-1">
                {note.visibility === 'squad' ? (
                  <>
                    <Users className="w-3 h-3 text-emerald-400" /> Squad Shared
                  </>
                ) : note.visibility === 'public' ? (
                  <>
                    <Globe className="w-3 h-3 text-cyan-400" /> Public HQ
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-purple-400" /> Personal
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{note.title}</h2>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <AvatarIcon avatarId={note.authorAvatar} size="sm" />
                <span className="font-semibold text-slate-300">{note.authorName}</span>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(note.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium border border-cyan-900/50 bg-cyan-950/30 text-cyan-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Formatted Note Content */}
          <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/30 font-sans text-sm sm:text-base leading-relaxed text-slate-200 whitespace-pre-wrap select-text">
            {note.content}
          </div>

          {/* Reactions bar */}
          <div className="flex items-center justify-between py-2 border-y border-slate-900">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onLike(note.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                  isLiked
                    ? 'border-rose-600 bg-rose-950/60 text-rose-300 font-bold shadow-sm shadow-rose-900/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-rose-400'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{note.likes?.length || 0} Likes</span>
              </button>

              <button
                type="button"
                onClick={() => onBookmark(note.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                  isBookmarked
                    ? 'border-cyan-600 bg-cyan-950/60 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-cyan-400'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Author moderation controls */}
            {isAuthor && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(note);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-mono"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1 rounded-lg border border-slate-800 text-slate-400 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-800 text-rose-400 hover:border-rose-900 hover:bg-rose-950/40 text-xs font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Comments / Doubts Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Doubts & Squad Discussion ({note.comments?.length || 0})
              </h3>
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a doubt or share an exam tip on this note..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/70 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {note.comments && note.comments.length > 0 ? (
                note.comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-slate-900 bg-slate-900/40 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <AvatarIcon avatarId={c.authorAvatar} size="sm" />
                        <span className="font-semibold text-slate-200">{c.authorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-8 font-sans">{c.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono border border-dashed border-slate-900 rounded-xl">
                  No doubts posted yet. Be the first to start the discussion!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-900 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};
