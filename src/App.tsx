import React, { useState, useEffect } from 'react';
import { Chapter, StudyNote, StudyRoom, LeaderboardEntry, ChapterStatus } from './types';
import { api } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HeaderHUD } from './components/HeaderHUD';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ChaptersView } from './views/ChaptersView';
import { NotesView } from './views/NotesView';
import { SquadsView } from './views/SquadsView';
import { LeaderboardView } from './views/LeaderboardView';
import { QuizzesView } from './views/QuizzesView';
import { ChapterDetailModal } from './components/ChapterDetailModal';
import { NotesEditorModal } from './components/NotesEditorModal';
import { NoteReaderModal } from './components/NoteReaderModal';
import { QuizModal } from './components/QuizModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import confetti from 'canvas-confetti';

function MainAppContent() {
  const { user, refreshUser, playSound } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Application Data States
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedChapterForDetail, setSelectedChapterForDetail] = useState<Chapter | null>(null);
  const [aiBriefingChapter, setAiBriefingChapter] = useState<Chapter | null>(null);
  const [activeQuizState, setActiveQuizState] = useState<{ open: boolean; chapterId?: number; chapterName?: string }>({
    open: false,
  });
  const [createNoteState, setCreateNoteState] = useState<{ open: boolean; initialChapterId?: number }>({
    open: false,
  });
  const [readingNote, setReadingNote] = useState<StudyNote | null>(null);

  // Initial Data Fetching
  const loadData = async () => {
    try {
      const [chRes, notesRes, roomsRes, lbRes] = await Promise.all([
        api.getChapters(),
        api.getNotes(),
        api.getRooms(),
        api.getLeaderboard(),
      ]);
      setChapters(chRes.chapters || []);
      setNotes(notesRes.notes || []);
      setRooms(roomsRes.rooms || []);
      setLeaderboard(lbRes.leaderboard || []);
    } catch (e) {
      console.error('Initial data loading error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Real-time EventSource listener
  useEffect(() => {
    const unsubscribe = api.subscribeToEvents(selectedRoom?.id, (event, data) => {
      if (event === 'new_note') {
        setNotes((prev) => [data.note, ...prev.filter((n) => n.id !== data.note.id)]);
      } else if (event === 'update_note') {
        setNotes((prev) => prev.map((n) => (n.id === data.note.id ? data.note : n)));
        if (readingNote?.id === data.note.id) {
          setReadingNote(data.note);
        }
      } else if (event === 'delete_note') {
        setNotes((prev) => prev.filter((n) => n.id !== data.noteId));
      } else if (event === 'room_update') {
        setRooms((prev) => {
          const exists = prev.some((r) => r.id === data.room.id);
          if (exists) {
            return prev.map((r) => (r.id === data.room.id ? data.room : r));
          }
          return [data.room, ...prev];
        });
        if (selectedRoom?.id === data.room.id) {
          setSelectedRoom(data.room);
        }
      } else if (event === 'leaderboard_update') {
        api.getLeaderboard().then((res) => setLeaderboard(res.leaderboard || []));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedRoom?.id, readingNote?.id]);

  // Chapter Progress Handlers
  const handleUpdateChapterStatus = async (chapterId: number, status: ChapterStatus) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await api.updateChapterProgress(chapterId, { status });
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, ...res.progress } : c))
      );
      if (res.earnedXp > 0) {
        playSound('levelUp');
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else {
        playSound('complete');
      }
      refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to update progress');
    }
  };

  const handleToggleRevision = async (chapterId: number, current: boolean) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await api.updateChapterProgress(chapterId, { revisionStatus: !current });
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, ...res.progress } : c))
      );
      playSound('click');
      refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle revision');
    }
  };

  const handleSaveChapterProgress = async (chapterId: number, data: Partial<Chapter>) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const res = await api.updateChapterProgress(chapterId, data);
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, ...res.progress } : c))
    );
    refreshUser();
  };

  // Notes Handlers
  const handleSaveNote = async (noteData: Partial<StudyNote>) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (noteData.id) {
      const res = await api.updateNote(noteData.id, noteData);
      setNotes((prev) => prev.map((n) => (n.id === res.note.id ? res.note : n)));
      playSound('complete');
    } else {
      const res = await api.createNote(noteData);
      setNotes((prev) => [res.note, ...prev]);
      if (res.earnedXp > 0) {
        playSound('levelUp');
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
        });
      }
    }
    refreshUser();
  };

  const handleLikeNote = async (noteId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const res = await api.toggleLikeNote(noteId);
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, likes: res.likes } : n))
    );
    if (readingNote && readingNote.id === noteId) {
      setReadingNote({ ...readingNote, likes: res.likes });
    }
    playSound('click');
  };

  const handleBookmarkNote = async (noteId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const res = await api.toggleBookmarkNote(noteId);
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, bookmarks: res.bookmarks } : n))
    );
    if (readingNote && readingNote.id === noteId) {
      setReadingNote({ ...readingNote, bookmarks: res.bookmarks });
    }
    playSound('click');
  };

  const handleAddComment = async (noteId: string, content: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const res = await api.addNoteComment(noteId, content);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, comments: [...(n.comments || []), res.comment] } : n
      )
    );
    if (readingNote && readingNote.id === noteId) {
      setReadingNote({
        ...readingNote,
        comments: [...(readingNote.comments || []), res.comment],
      });
    }
    playSound('complete');
  };

  const handleDeleteNote = async (noteId: string) => {
    await api.deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    playSound('alert');
  };

  // Rooms Handlers
  const handleCreateRoom = async (data: { name: string; description?: string; subjectFocus?: string; maxMembers?: number }) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const res = await api.createRoom(data);
    setRooms((prev) => [res.room, ...prev]);
    setSelectedRoom(res.room);
    playSound('levelUp');
  };

  const handleJoinRoom = async (code: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const res = await api.joinRoom(code);
    setRooms((prev) => prev.map((r) => (r.id === res.room.id ? res.room : r)));
    setSelectedRoom(res.room);
    playSound('complete');
  };

  const handleLeaveRoom = async (roomId: string) => {
    await api.leaveRoom(roomId);
    setSelectedRoom(null);
    playSound('click');
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header HUD */}
      <HeaderHUD
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        activeRoomName={selectedRoom?.name}
      />

      {/* Main Layout: Sidebar + Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar
          currentTab={currentTab}
          onChangeTab={(t) => {
            setCurrentTab(t);
            if (t !== 'squads') {
              setSelectedRoom(null);
            }
          }}
          notesCount={notes.length}
          roomsCount={rooms.length}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              chapters={chapters}
              notes={notes}
              rooms={rooms}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenChapterDetails={(ch) => setSelectedChapterForDetail(ch)}
              onOpenAiBriefing={(ch) => setAiBriefingChapter(ch)}
              onOpenNoteReader={(n) => setReadingNote(n)}
              onOpenCreateNote={() => setCreateNoteState({ open: true })}
              onSelectRoom={(r) => {
                setSelectedRoom(r);
                setCurrentTab('squads');
              }}
            />
          )}

          {currentTab === 'chapters' && (
            <ChaptersView
              chapters={chapters}
              onUpdateStatus={handleUpdateChapterStatus}
              onToggleRevision={handleToggleRevision}
              onOpenDetails={(ch) => setSelectedChapterForDetail(ch)}
              onOpenAiBriefing={(ch) => setAiBriefingChapter(ch)}
              onTakeQuiz={(ch) =>
                setActiveQuizState({ open: true, chapterId: ch.id, chapterName: ch.name })
              }
            />
          )}

          {currentTab === 'notes' && (
            <NotesView
              notes={notes}
              onOpenCreateNote={() => setCreateNoteState({ open: true })}
              onOpenNoteReader={(n) => setReadingNote(n)}
              onLikeNote={handleLikeNote}
              onBookmarkNote={handleBookmarkNote}
            />
          )}

          {currentTab === 'squads' && (
            <SquadsView
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onLeaveRoom={handleLeaveRoom}
            />
          )}

          {currentTab === 'leaderboard' && <LeaderboardView leaderboard={leaderboard} />}

          {currentTab === 'quizzes' && (
            <QuizzesView
              chapters={chapters}
              onOpenQuizForChapter={(chapterId, chapterName) =>
                setActiveQuizState({ open: true, chapterId, chapterName })
              }
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'ai-lab' && (
            <div className="py-8">
              <AiAssistantModal
                initialChapter={chapters[0] || null}
                onClose={() => setCurrentTab('dashboard')}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      {authModalOpen && <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />}

      {profileModalOpen && (
        <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      )}

      {selectedChapterForDetail && (
        <ChapterDetailModal
          chapter={selectedChapterForDetail}
          onClose={() => setSelectedChapterForDetail(null)}
          onSaveProgress={handleSaveChapterProgress}
          onOpenAiBriefing={(ch) => setAiBriefingChapter(ch)}
          onOpenCreateNoteForChapter={(ch) => {
            setCreateNoteState({ open: true, initialChapterId: ch.id });
          }}
        />
      )}

      {aiBriefingChapter && (
        <AiAssistantModal
          initialChapter={aiBriefingChapter}
          onClose={() => setAiBriefingChapter(null)}
        />
      )}

      {activeQuizState.open && (
        <QuizModal
          chapterId={activeQuizState.chapterId}
          chapterName={activeQuizState.chapterName}
          onClose={() => setActiveQuizState({ open: false })}
          onQuizCompleted={() => {
            api.getLeaderboard().then((res) => setLeaderboard(res.leaderboard || []));
          }}
        />
      )}

      {createNoteState.open && (
        <NotesEditorModal
          initialChapterId={createNoteState.initialChapterId}
          onClose={() => setCreateNoteState({ open: false })}
          onSave={handleSaveNote}
        />
      )}

      {readingNote && (
        <NoteReaderModal
          note={readingNote}
          onClose={() => setReadingNote(null)}
          onLike={handleLikeNote}
          onBookmark={handleBookmarkNote}
          onAddComment={handleAddComment}
          onDelete={handleDeleteNote}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
