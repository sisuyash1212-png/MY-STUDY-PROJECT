import React, { useState } from 'react';
import { StudyNote, NoteTag } from '../types';
import { RAW_CHAPTERS_DATA } from '../data/chapters';
import { X, Send, Save, Tag, Eye, Lock, Users, Globe, Sparkles } from 'lucide-react';

interface NotesEditorModalProps {
  initialChapterId?: number;
  initialNote?: StudyNote | null;
  onClose: () => void;
  onSave: (noteData: Partial<StudyNote>) => Promise<void>;
}

const AVAILABLE_TAGS: NoteTag[] = [
  'Important',
  'Formula Sheet',
  'Revision',
  'Definitions',
  'Exam Questions',
  'Diagrams',
  'Mnemonics',
];

export const NotesEditorModal: React.FC<NotesEditorModalProps> = ({
  initialChapterId,
  initialNote,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [chapterId, setChapterId] = useState<number>(initialNote?.chapterId || initialChapterId || 1);
  const [topic, setTopic] = useState(initialNote?.topic || '');
  const [content, setContent] = useState(
    initialNote?.content ||
      `### 📝 Key Concepts & Definitions
- 

### ⚡ Essential Formulas & Equations
- 

### 🎯 High-Yield Exam Questions & Tips
- `
  );
  const [tags, setTags] = useState<NoteTag[]>(initialNote?.tags || ['Revision']);
  const [visibility, setVisibility] = useState<'personal' | 'squad' | 'public'>(initialNote?.visibility || 'squad');
  const [isDraft, setIsDraft] = useState(initialNote?.isDraft || false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag: NoteTag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async (draft = false) => {
    if (!title.trim()) {
      setError('Please provide a note title.');
      return;
    }
    if (!content.trim()) {
      setError('Note content cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        id: initialNote?.id,
        title: title.trim(),
        chapterId,
        topic: topic.trim() || 'General Science',
        content: content.trim(),
        tags,
        visibility,
        isDraft: draft,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + '\n' + snippet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-emerald-800/80 bg-slate-950 shadow-2xl shadow-emerald-950/40 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-900 bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialNote ? 'Edit Study Note' : 'Share Notes With Squad'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Collaborative Science Mission Knowledge Base • Earn +25 XP
              </p>
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

        {/* Scrollable Form */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-200 text-sm">
          {error && (
            <div className="p-3 rounded-xl border border-rose-900 bg-rose-950/50 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Title & Chapter Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Note Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chemical Reactions & Balancing Equations Summary"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Chapter (1-40) *</label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-mono"
              >
                {RAW_CHAPTERS_DATA.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.srNo} {ch.name.slice(0, 24)} ({ch.weightagePerYear})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Topic / Sub-theme</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Exothermic vs Endothermic reactions, Catalysts"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Sharing Scope</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('squad')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all ${
                    visibility === 'squad'
                      ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300 font-bold'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Squad Shared</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all ${
                    visibility === 'public'
                      ? 'border-cyan-500 bg-cyan-950/70 text-cyan-300 font-bold'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public HQ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('personal')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all ${
                    visibility === 'personal'
                      ? 'border-purple-500 bg-purple-950/70 text-purple-300 font-bold'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Personal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Note Tags</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                      active
                        ? 'border-emerald-600 bg-emerald-950 text-emerald-300 font-semibold shadow-sm shadow-emerald-500/20'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Snippets & Markdown Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-slate-500 mr-1">Insert:</span>
              <button
                type="button"
                onClick={() => insertSnippet('$$\\text{Formula}: E = mc^2$$')}
                className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-[11px] font-mono text-cyan-300"
              >
                + Formula
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('### 💡 Key Definition:\n- ')}
                className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-[11px] font-mono text-emerald-300"
              >
                + Definition
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('⚠️ **Common Exam Mistake**: ')}
                className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-[11px] font-mono text-amber-300"
              >
                + Exam Trap
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-cyan-400"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{previewMode ? 'Edit Mode' : 'Preview Note'}</span>
            </button>
          </div>

          {/* Content Editor or Preview */}
          {previewMode ? (
            <div className="w-full min-h-[220px] max-h-[300px] overflow-y-auto p-4 rounded-xl border border-slate-800 bg-slate-900/40 prose prose-invert max-w-none text-slate-200 text-sm whitespace-pre-wrap font-sans">
              {content || 'No content written yet.'}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write detailed revision notes, laws, examples, step-by-step derivations..."
              rows={9}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono leading-relaxed"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : '+ Share Notes (+25 XP)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
