export type ChapterStatus = 'not-started' | 'in-progress' | 'completed';

export interface Chapter {
  id: number;
  srNo: number;
  name: string;
  sourceBoard: string;
  weightagePerYear: string;
  totalQuestions: number;
  // Account-specific progress (loaded per user)
  status: ChapterStatus;
  revisionStatus: boolean;
  notes: string;
  confidenceRating?: number; // 1 to 5
  difficultyRating?: 'Easy' | 'Medium' | 'Hard';
  lastRevisedAt?: string;
}

export interface StudentProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  rankTitle: string;
  streakDays: number;
  completedChaptersCount: number;
  revisionsCount: number;
  quizzesCompletedCount: number;
  activeSquadId?: string;
  badges: string[];
  bio?: string;
  targetExamYear?: string;
  createdAt: string;
}

export interface NoteComment {
  id: string;
  noteId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export type NoteTag = 'Important' | 'Formula Sheet' | 'Revision' | 'Definitions' | 'Exam Questions' | 'Diagrams' | 'Mnemonics';

export interface StudyNote {
  id: string;
  title: string;
  chapterId: number;
  chapterName: string;
  topic: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  tags: NoteTag[];
  visibility: 'personal' | 'squad' | 'public';
  squadId?: string;
  likes: string[]; // array of userIds
  bookmarks: string[]; // array of userIds
  comments: NoteComment[];
  isDraft: boolean;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomMember {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: 'host' | 'member';
  joinedAt: string;
  isOnline: boolean;
  level: number;
  xp: number;
}

export interface StudyRoom {
  id: string;
  code: string;
  name: string;
  description: string;
  subjectFocus: string;
  hostId: string;
  hostName: string;
  members: RoomMember[];
  maxMembers: number;
  isLocked?: boolean;
  passcode?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  type?: 'chat' | 'system' | 'milestone';
}

export interface QuizQuestion {
  id: string;
  chapterId: number;
  chapterName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  category: 'daily' | 'squad' | 'special';
  badgeReward?: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  xp: number;
  rankTitle: string;
  completedChaptersCount: number;
  quizzesCompletedCount: number;
  streakDays: number;
  isCurrentUser?: boolean;
}
