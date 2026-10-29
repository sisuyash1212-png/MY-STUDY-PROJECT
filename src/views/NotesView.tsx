import React, { useState, useMemo } from 'react';
import { StudyNote } from '../types';
import { RAW_CHAPTERS_DATA } from '../data/chapters';
import { AvatarIcon } from '../components/AvatarPicker';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Heart,
  Bookmark,
  MessageSquare,
  Users,
  Lock,
  Globe,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface NotesViewProps {
  notes: StudyNote[];
  onOpenCreateNote: () => void;
  onOpenNoteReader: (note: StudyNote) => void;
  onLikeNote: (noteId: string) => Promise<void>;
  onBookmarkNote: (noteId: string) => Promise<void>;
}

type NoteTab = 'all' | 'my' | 'squad' | 'saved' | 'drafts';

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onOpenCreateNote,
  onOpenNoteReader,
  onLikeNote,
  onBookmarkNote,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NoteTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState<number | 'all'>('all');

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Tab filter
    if (activeTab === 'my') {
      result = result.filter((n) => user && n.authorId === user.id);
    } else if (activeTab === 'squad') {
      result = result.filter((n) => !n.isDraft && (n.visibility === 'squad' || n.visibility === 'public'));
    } else if (activeTab === 'saved') {
      result = result.filter((n) => user && n.bookmarks?.includes(user.id));
    } else if (activeTab === 'drafts') {
      result = result.filter((n) => user && n.authorId === user.id && n.isDraft);
    } else {
      // 'all' notes
      result = result.filter((n) => {
        if (n.isDraft) return user && n.authorId === user.id;
        if (n.visibility === 'personal') return user && n.authorId === user.id;
        return true;
      });
    }

    // Chapter filter
    if (selectedChapterId !== 'all') {
      result = result.filter((n) => n.chapterId === selectedChapterId);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.chapterName.toLowerCase().includes(q) ||
          n.authorName.toLowerCase().includes(q) ||
          n.topic?.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [notes, activeTab, selectedChapterId, searchQuery, user]);

  return (
    <div className="space-y-6 pb-16">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Friends' Notes Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Shared digital notebook for the entire squad. Post formulas, definitions, and doubts.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateNote}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Share Notes (+25 XP)</span>
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-3">
          {[
            { id: 'all', label: 'All Notes' },
            { id: 'squad', label: 'Squad Notes' },
            { id: 'my', label: 'My Notes' },
            { id: 'saved', label: 'Saved Notes' },
            { id: 'drafts', label: 'Drafts' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as NoteTab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                activeTab === tab.id
                  ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Chapter Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, topic, author, tags, or chapter..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <div>
            <select
              value={selectedChapterId}
              onChange={(e) =>
                setSelectedChapterId(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Filter by Chapter: All 40</option>
              {RAW_CHAPTERS_DATA.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  #{ch.srNo} {ch.name.slice(0, 26)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
          <FileText className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold font-mono text-slate-300">No study notes found</h3>
          <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
            {activeTab === 'saved'
              ? 'You have not saved or bookmarked any notes yet.'
              : 'Be the hero of your squad! Click "+ Share Notes" to post formulas, derivations, or summaries.'}
          </p>
          <button
            type="button"
            onClick={onOpenCreateNote}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const isLiked = user && note.likes?.includes(user.id);
            const isBookmarked = user && note.bookmarks?.includes(user.id);

            return (
              <div
                key={note.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-emerald-600/60 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Chapter badge & Scope */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                      CH #{note.chapterId}
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1">
                      {note.visibility === 'squad' ? (
                        <>
                          <Users className="w-3 h-3 text-emerald-400" /> Squad
                        </>
                      ) : note.visibility === 'public' ? (
                        <>
                          <Globe className="w-3 h-3 text-cyan-400" /> Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-purple-400" /> Private
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <h3
                    onClick={() => onOpenNoteReader(note)}
                    className="text-base font-bold text-white group-hover:text-emerald-300 cursor-pointer transition-colors leading-snug line-clamp-2"
                  >
                    {note.title}
                  </h3>

                  <div className="text-xs text-slate-400 font-mono mt-1 line-clamp-1">{note.topic}</div>

                  <p
                    onClick={() => onOpenNoteReader(note)}
                    className="text-xs text-slate-300 font-sans mt-2.5 line-clamp-3 leading-relaxed cursor-pointer opacity-90"
                  >
                    {note.content.replace(/###/g, '').replace(/\$\$/g, '')}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {note.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Author & Interaction buttons */}
                <div className="pt-3.5 mt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <AvatarIcon avatarId={note.authorAvatar} size="sm" />
                    <span className="font-semibold text-slate-300 truncate max-w-[100px]">
                      {note.authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onLikeNote(note.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                      <span>{note.likes?.length || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onBookmarkNote(note.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isBookmarked ? 'text-cyan-400 font-bold' : 'hover:text-cyan-400'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenNoteReader(note)}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{note.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
