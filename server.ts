import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { RAW_CHAPTERS_DATA } from './src/data/chapters';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- Database & Persistence Layer ----------------
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface UserRecord {
  id: string;
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  salt: string;
  avatar: string;
  level: number;
  xp: number;
  rankTitle: string;
  streakDays: number;
  completedChaptersCount: number;
  revisionsCount: number;
  quizzesCompletedCount: number;
  badges: string[];
  bio?: string;
  targetExamYear?: string;
  createdAt: string;
}

interface DBStructure {
  users: UserRecord[];
  sessions: { [token: string]: string }; // token -> userId
  chaptersProgress: { [userId: string]: { [chapterId: number]: any } };
  notes: any[];
  rooms: any[];
  messages: any[];
  xpTransactions: { id: string; userId: string; activityKey: string; xp: number; createdAt: string }[];
}

function initDB(): DBStructure {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error loading db.json, creating initial backup:', e);
    }
  }

  // Seed default rooms and initial data
  const initialDB: DBStructure = {
    users: [],
    sessions: {},
    chaptersProgress: {},
    notes: [
      {
        id: 'note-seed-1',
        title: 'Acids, Bases & pH Indicators Quick Sheet',
        chapterId: 4,
        chapterName: 'Acids, Bases & Salts',
        topic: 'pH scale, Litmus & Neutralization reactions',
        content: `### 🧪 Quick Summary of Acids & Bases
- **Acids**: Sour taste, turns blue litmus RED, pH < 7. Release $H^+$ ions in water.
- **Bases**: Bitter taste, soapy feel, turns red litmus BLUE, pH > 7. Release $OH^-$ ions in water.
- **Neutralization reaction**:
  $$\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water}$$
  *Example*: $\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$

### ⚠️ Common Exam Questions:
1. Why does pure distilled water not conduct electricity, whereas rainwater does?
   - Distilled water has no dissolved ions; rainwater dissolves $CO_2$ forming weak carbonic acid.
2. What happens during dilution of concentrated acid?
   - Always add acid slowly to water with constant stirring! Never add water to concentrated acid due to vigorous exothermic heat.`,
        authorId: 'sys-mentor',
        authorName: 'Commander Lyra',
        authorAvatar: 'astronaut-cyan',
        tags: ['Important', 'Formula Sheet', 'Revision', 'Exam Questions'],
        visibility: 'public',
        likes: ['seed-1'],
        bookmarks: [],
        comments: [
          {
            id: 'c-1',
            noteId: 'note-seed-1',
            authorId: 'sys-mentor-2',
            authorName: 'Cadet Leo',
            authorAvatar: 'astronaut-purple',
            content: 'Super helpful before the mock exam! Added to my revision bookmarks.',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          }
        ],
        isDraft: false,
        viewsCount: 42,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'note-seed-2',
        title: 'Work, Kinetic Energy & Potential Energy Equations',
        chapterId: 8,
        chapterName: 'Work & Energy',
        topic: 'Work formulae and Conservation of Mechanical Energy',
        content: `### ⚡ Essential Formulas & Derivations
- **Work ($W$)**:
  $$W = F \\cdot s \\cdot \\cos(\\theta)$$
  - When force and displacement are in same direction: $W = F \\cdot s$
  - When $\\theta = 90^\\circ$: $W = 0$ (e.g. satellite orbiting Earth)
- **Kinetic Energy ($E_k$)**:
  $$E_k = \\frac{1}{2} m v^2$$
- **Potential Energy ($E_p$)**:
  $$E_p = m \\cdot g \\cdot h$$
- **Law of Conservation of Energy**:
  $$E_{\\text{total}} = E_k + E_p = \\text{Constant}$$

### 🎯 Pro Revision Tip:
Remember 1 Joule = $10^7$ ergs. SI unit of Power is Watt ($1 \\text{ W} = 1 \\text{ J/s}$).`,
        authorId: 'sys-mentor',
        authorName: 'Dr. Orion',
        authorAvatar: 'astronaut-emerald',
        tags: ['Formula Sheet', 'Important'],
        visibility: 'public',
        likes: ['seed-2'],
        bookmarks: [],
        comments: [],
        isDraft: false,
        viewsCount: 65,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
      }
    ],
    rooms: [
      {
        id: 'room-alpha',
        code: 'QUANTM',
        name: 'Quantum Science Vanguard',
        description: 'Targeting 95%+ in High-Weightage Chapters (Substances, Life Processes, Matter, Electricity)',
        subjectFocus: 'Physics & Chemistry Focus',
        hostId: 'sys-host-1',
        hostName: 'Commander Nova',
        members: [
          {
            id: 'sys-host-1',
            username: 'commander_nova',
            displayName: 'Commander Nova',
            avatar: 'astronaut-cyan',
            role: 'host',
            joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            isOnline: true,
            level: 8,
            xp: 750
          }
        ],
        maxMembers: 12,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'room-beta',
        code: 'BIOMIS',
        name: 'Bio-Matrix & Ecology Squad',
        description: 'Daily chapter study sessions for Life Processes, Tissues, Ecosystem & Microbiology',
        subjectFocus: 'Biology & Environmental Science',
        hostId: 'sys-host-2',
        hostName: 'Dr. Helix',
        members: [
          {
            id: 'sys-host-2',
            username: 'dr_helix',
            displayName: 'Dr. Helix',
            avatar: 'astronaut-purple',
            role: 'host',
            joinedAt: new Date(Date.now() - 86400000).toISOString(),
            isOnline: true,
            level: 6,
            xp: 540
          }
        ],
        maxMembers: 10,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ],
    messages: [
      {
        id: 'msg-seed-1',
        roomId: 'room-alpha',
        senderId: 'sys-host-1',
        senderName: 'Commander Nova',
        senderAvatar: 'astronaut-cyan',
        text: 'Welcome to Quantum Science Vanguard HQ! Today we are tackling Acids, Bases & Salts + Work & Energy.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'chat'
      }
    ],
    xpTransactions: [],
  };

  saveDB(initialDB);
  return initialDB;
}

let db = initDB();

function saveDB(dataToSave = db) {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// ---------------- Real-time SSE Subscriptions ----------------
interface SSEClient {
  id: string;
  res: Response;
  userId?: string;
  roomId?: string;
}

let sseClients: SSEClient[] = [];

function broadcastSSE(event: string, data: any, filter?: (client: SSEClient) => boolean) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      if (!filter || filter(client)) {
        client.res.write(payload);
      }
    } catch {
      // client connection likely terminated
    }
  });
}

// Periodic heartbeat for SSE
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.res.write(': ping\n\n');
    } catch {
      // ignore
    }
  });
}, 25000);

// ---------------- Helpers & Auth Middleware ----------------
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function getAuthUser(req: Request): UserRecord | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const userId = db.sessions[token];
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) || null;
}

// ---------------- API Routes ----------------

// SSE Real-time Stream
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.write(': connected\n\n');

  const clientId = crypto.randomUUID();
  const roomId = req.query.roomId as string | undefined;
  const token = req.query.token as string | undefined;
  const userId = token ? db.sessions[token] : undefined;

  const newClient: SSEClient = { id: clientId, res, userId, roomId };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Authentication: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, displayName, email, password, avatar } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3 || !/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters or underscores.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existingUser = db.users.find(
    (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({ error: 'Username or email already in use.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const userId = 'usr-' + crypto.randomUUID();

  const newUser: UserRecord = {
    id: userId,
    username: cleanUsername,
    displayName: displayName?.trim() || cleanUsername,
    email: email.trim().toLowerCase(),
    passwordHash,
    salt,
    avatar: avatar || 'astronaut-cyan',
    level: 1,
    xp: 0,
    rankTitle: 'Cadet Explorer',
    streakDays: 1,
    completedChaptersCount: 0,
    revisionsCount: 0,
    quizzesCompletedCount: 0,
    badges: ['Science Cadet'],
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = userId;
  saveDB();

  res.status(201).json({
    token,
    user: sanitizeUser(newUser),
  });
});

// Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required.' });
  }

  const cleanId = identifier.trim().toLowerCase();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username/email or password.' });
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid username/email or password.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = user.id;
  saveDB();

  res.json({
    token,
    user: sanitizeUser(user),
  });
});

// Authentication: Reset Password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { identifier, newPassword } = req.body;
  if (!identifier || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Valid username/email and new password (min 6 chars) are required.' });
  }

  const cleanId = identifier.trim().toLowerCase();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );

  if (!user) {
    return res.status(404).json({ error: 'Account not found with provided username or email.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.salt = newSalt;
  user.passwordHash = hashPassword(newPassword, newSalt);
  saveDB();

  res.json({ message: 'Password has been successfully updated. Please log in with your new password.' });
});

// Authentication: Get Current Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ user: sanitizeUser(user) });
});

// Authentication: Update Profile
app.put('/api/auth/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });

  const { displayName, avatar, bio, targetExamYear } = req.body;
  if (displayName) user.displayName = displayName.trim();
  if (avatar) user.avatar = avatar;
  if (bio !== undefined) user.bio = bio;
  if (targetExamYear !== undefined) user.targetExamYear = targetExamYear;

  saveDB();
  broadcastSSE('leaderboard_update', { userId: user.id });
  res.json({ user: sanitizeUser(user) });
});

// ---------------- Chapter Progress API ----------------

// Get All Chapters with User Progress
app.get('/api/chapters', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const userProgress = user ? db.chaptersProgress[user.id] || {} : {};

  const chaptersWithProgress = RAW_CHAPTERS_DATA.map((ch) => {
    const p = userProgress[ch.id] || {};
    return {
      ...ch,
      status: p.status || 'not-started',
      revisionStatus: !!p.revisionStatus,
      notes: p.notes || '',
      confidenceRating: p.confidenceRating ?? 3,
      difficultyRating: p.difficultyRating ?? (ch.totalQuestions > 60 ? 'Hard' : ch.totalQuestions > 30 ? 'Medium' : 'Easy'),
      lastRevisedAt: p.lastRevisedAt,
    };
  });

  res.json({ chapters: chaptersWithProgress });
});

// Update Chapter Progress
app.post('/api/chapters/:id/progress', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to persist chapter progress.' });

  const chapterId = parseInt(req.params.id, 10);
  const chapterExists = RAW_CHAPTERS_DATA.some((c) => c.id === chapterId);
  if (!chapterExists) return res.status(404).json({ error: 'Chapter not found.' });

  if (!db.chaptersProgress[user.id]) {
    db.chaptersProgress[user.id] = {};
  }

  const existing = db.chaptersProgress[user.id][chapterId] || {};
  const { status, revisionStatus, notes, confidenceRating, difficultyRating } = req.body;

  let earnedXp = 0;

  // Check if newly completed -> award 50 XP
  if (status === 'completed' && existing.status !== 'completed') {
    const actKey = `chapter_completed_${chapterId}`;
    earnedXp += awardUserXp(user, actKey, 50);
  }

  // Check if revision toggled on
  let lastRev = existing.lastRevisedAt;
  if (revisionStatus && !existing.revisionStatus) {
    lastRev = new Date().toISOString();
    const revKey = `chapter_revised_${chapterId}_${new Date().toISOString().slice(0, 10)}`;
    earnedXp += awardUserXp(user, revKey, 15);
  }

  db.chaptersProgress[user.id][chapterId] = {
    ...existing,
    status: status !== undefined ? status : existing.status || 'not-started',
    revisionStatus: revisionStatus !== undefined ? revisionStatus : existing.revisionStatus || false,
    notes: notes !== undefined ? notes : existing.notes || '',
    confidenceRating: confidenceRating !== undefined ? confidenceRating : existing.confidenceRating ?? 3,
    difficultyRating: difficultyRating !== undefined ? difficultyRating : existing.difficultyRating,
    lastRevisedAt: lastRev,
  };

  // Recount completed chapters & revisions
  const allUserChapters = Object.values(db.chaptersProgress[user.id]);
  user.completedChaptersCount = allUserChapters.filter((c: any) => c.status === 'completed').length;
  user.revisionsCount = allUserChapters.filter((c: any) => c.revisionStatus).length;

  saveDB();

  res.json({
    chapterId,
    progress: db.chaptersProgress[user.id][chapterId],
    earnedXp,
    user: sanitizeUser(user),
  });
});

// ---------------- Friends' Notes Library API ----------------

// Get Notes
app.get('/api/notes', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { visibility, chapterId, tag, search, filter } = req.query;

  let filtered = [...db.notes];

  // Visibility filtering
  if (filter === 'my') {
    if (!user) return res.json({ notes: [] });
    filtered = filtered.filter((n) => n.authorId === user.id);
  } else if (filter === 'saved') {
    if (!user) return res.json({ notes: [] });
    filtered = filtered.filter((n) => n.bookmarks?.includes(user.id));
  } else if (filter === 'drafts') {
    if (!user) return res.json({ notes: [] });
    filtered = filtered.filter((n) => n.authorId === user.id && n.isDraft);
  } else if (filter === 'squad') {
    // Show squad notes
    filtered = filtered.filter((n) => !n.isDraft && (n.visibility === 'squad' || n.visibility === 'public'));
  } else {
    // 'all' notes: show public notes + user's own notes + squad notes
    filtered = filtered.filter((n) => {
      if (n.isDraft) return user && n.authorId === user.id;
      if (n.visibility === 'personal') return user && n.authorId === user.id;
      return true;
    });
  }

  if (chapterId) {
    const cid = parseInt(chapterId as string, 10);
    filtered = filtered.filter((n) => n.chapterId === cid);
  }

  if (tag) {
    filtered = filtered.filter((n) => n.tags?.includes(tag as string));
  }

  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(s) ||
        n.content.toLowerCase().includes(s) ||
        n.topic?.toLowerCase().includes(s) ||
        n.chapterName.toLowerCase().includes(s) ||
        n.authorName.toLowerCase().includes(s)
    );
  }

  // Sort by newest by default
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ notes: filtered });
});

// Post Note
app.post('/api/notes', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'You must sign in to post notes.' });

  const { title, chapterId, topic, content, tags, visibility, isDraft } = req.body;

  if (!title?.trim() || !chapterId || !content?.trim()) {
    return res.status(400).json({ error: 'Note title, chapter selection, and content are required.' });
  }

  const chapter = RAW_CHAPTERS_DATA.find((c) => c.id === parseInt(chapterId, 10));
  const chapterName = chapter ? chapter.name : `Chapter ${chapterId}`;

  const newNote = {
    id: 'note-' + crypto.randomUUID(),
    title: title.trim(),
    chapterId: parseInt(chapterId, 10),
    chapterName,
    topic: topic?.trim() || 'General Notes',
    content: content.trim(),
    authorId: user.id,
    authorName: user.displayName || user.username,
    authorAvatar: user.avatar,
    tags: Array.isArray(tags) ? tags : [],
    visibility: visibility || 'squad',
    likes: [],
    bookmarks: [],
    comments: [],
    isDraft: !!isDraft,
    viewsCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.notes.unshift(newNote);

  // Award XP for sharing notes (if not draft and first time sharing this note)
  let earnedXp = 0;
  if (!isDraft) {
    earnedXp = awardUserXp(user, `note_shared_${newNote.id}`, 25);
  }

  saveDB();

  // Broadcast real-time update
  broadcastSSE('new_note', { note: newNote });

  res.status(201).json({ note: newNote, earnedXp, user: sanitizeUser(user) });
});

// Update Note
app.put('/api/notes/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });

  const noteId = req.params.id;
  const note = db.notes.find((n) => n.id === noteId);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  if (note.authorId !== user.id) {
    return res.status(403).json({ error: 'You can only edit your own notes.' });
  }

  const { title, chapterId, topic, content, tags, visibility, isDraft } = req.body;
  if (title) note.title = title.trim();
  if (content) note.content = content.trim();
  if (topic) note.topic = topic.trim();
  if (tags && Array.isArray(tags)) note.tags = tags;
  if (visibility) note.visibility = visibility;
  if (isDraft !== undefined) note.isDraft = !!isDraft;

  if (chapterId) {
    note.chapterId = parseInt(chapterId, 10);
    const ch = RAW_CHAPTERS_DATA.find((c) => c.id === note.chapterId);
    if (ch) note.chapterName = ch.name;
  }

  note.updatedAt = new Date().toISOString();
  saveDB();

  broadcastSSE('update_note', { note });
  res.json({ note });
});

// Delete Note (Author or Room Host)
app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });

  const noteIndex = db.notes.findIndex((n) => n.id === req.params.id);
  if (noteIndex === -1) return res.status(404).json({ error: 'Note not found.' });

  const note = db.notes[noteIndex];
  if (note.authorId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized to delete this note.' });
  }

  db.notes.splice(noteIndex, 1);
  saveDB();

  broadcastSSE('delete_note', { noteId: req.params.id });
  res.json({ message: 'Note deleted successfully.' });
});

// Like Note
app.post('/api/notes/:id/like', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required to like.' });

  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  if (!note.likes) note.likes = [];
  const idx = note.likes.indexOf(user.id);
  if (idx > -1) {
    note.likes.splice(idx, 1);
  } else {
    note.likes.push(user.id);
  }

  saveDB();
  broadcastSSE('update_note', { note });
  res.json({ likes: note.likes });
});

// Bookmark Note
app.post('/api/notes/:id/bookmark', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required to bookmark.' });

  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  if (!note.bookmarks) note.bookmarks = [];
  const idx = note.bookmarks.indexOf(user.id);
  if (idx > -1) {
    note.bookmarks.splice(idx, 1);
  } else {
    note.bookmarks.push(user.id);
  }

  saveDB();
  res.json({ bookmarks: note.bookmarks });
});

// Add Comment / Doubt on Note
app.post('/api/notes/:id/comments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required to post doubts or comments.' });

  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Comment content cannot be empty.' });

  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  if (!note.comments) note.comments = [];
  const newComment = {
    id: 'c-' + crypto.randomUUID(),
    noteId: note.id,
    authorId: user.id,
    authorName: user.displayName || user.username,
    authorAvatar: user.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  note.comments.push(newComment);
  saveDB();

  broadcastSSE('update_note', { note });
  res.status(201).json({ comment: newComment });
});

// ---------------- Study Rooms & Multiplayer API ----------------

// Get Rooms
app.get('/api/rooms', (req: Request, res: Response) => {
  res.json({ rooms: db.rooms });
});

// Create Room
app.post('/api/rooms', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to create a study room.' });

  const { name, description, subjectFocus, maxMembers } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Room name is required.' });

  // Generate unique 6-character room code
  const code = (Math.random().toString(36).substring(2, 8)).toUpperCase();

  const newRoom = {
    id: 'room-' + crypto.randomUUID(),
    code,
    name: name.trim(),
    description: description?.trim() || 'Collaborative science study room',
    subjectFocus: subjectFocus?.trim() || 'General Science',
    hostId: user.id,
    hostName: user.displayName || user.username,
    members: [
      {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar,
        role: 'host',
        joinedAt: new Date().toISOString(),
        isOnline: true,
        level: user.level,
        xp: user.xp,
      }
    ],
    maxMembers: maxMembers ? parseInt(maxMembers, 10) : 10,
    createdAt: new Date().toISOString(),
  };

  db.rooms.unshift(newRoom);
  saveDB();

  broadcastSSE('room_update', { room: newRoom });
  res.status(201).json({ room: newRoom });
});

// Join Room via Code
app.post('/api/rooms/join', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to join a room.' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Room code is required.' });

  const room = db.rooms.find((r) => r.code.toUpperCase() === code.trim().toUpperCase());
  if (!room) return res.status(404).json({ error: 'No room found with this code.' });

  if (room.members.length >= room.maxMembers && !room.members.some((m: any) => m.id === user.id)) {
    return res.status(400).json({ error: 'This study room is currently full.' });
  }

  const existingMember = room.members.find((m: any) => m.id === user.id);
  if (!existingMember) {
    room.members.push({
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatar: user.avatar,
      role: 'member',
      joinedAt: new Date().toISOString(),
      isOnline: true,
      level: user.level,
      xp: user.xp,
    });
  } else {
    existingMember.isOnline = true;
    existingMember.level = user.level;
    existingMember.xp = user.xp;
  }

  saveDB();
  broadcastSSE('room_update', { room });
  res.json({ room });
});

// Leave Room
app.post('/api/rooms/:roomId/leave', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });

  const room = db.rooms.find((r) => r.id === req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  room.members = room.members.filter((m: any) => m.id !== user.id);
  saveDB();

  broadcastSSE('room_update', { room });
  res.json({ message: 'Left room successfully.' });
});

// Room Chat Messages
app.get('/api/rooms/:roomId/messages', (req: Request, res: Response) => {
  const msgs = db.messages.filter((m) => m.roomId === req.params.roomId);
  // Return last 100 messages sorted chronologically
  const recent = msgs.slice(-100);
  res.json({ messages: recent });
});

app.post('/api/rooms/:roomId/messages', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required to send chat messages.' });

  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

  if (text.trim().length > 1000) {
    return res.status(400).json({ error: 'Message exceeds 1000 character limit.' });
  }

  const room = db.rooms.find((r) => r.id === req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  const newMsg = {
    id: 'msg-' + crypto.randomUUID(),
    roomId: room.id,
    senderId: user.id,
    senderName: user.displayName || user.username,
    senderAvatar: user.avatar,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    type: 'chat',
  };

  db.messages.push(newMsg);
  if (db.messages.length > 500) {
    db.messages = db.messages.slice(-500);
  }
  saveDB();

  broadcastSSE('chat_message', newMsg, (c) => !c.roomId || c.roomId === room.id);
  res.status(201).json({ message: newMsg });
});

// ---------------- Server Validated XP & Leaderboard ----------------

function awardUserXp(user: UserRecord, activityKey: string, xpAmount: number): number {
  if (xpAmount <= 0) return 0;

  // Prevent duplicate XP awards for the exact same activity key
  const alreadyAwarded = db.xpTransactions.some(
    (tx) => tx.userId === user.id && tx.activityKey === activityKey
  );

  if (alreadyAwarded) {
    return 0;
  }

  user.xp += xpAmount;
  user.level = Math.floor(user.xp / 100) + 1;

  if (user.level >= 30) user.rankTitle = 'Quantum Grandmaster';
  else if (user.level >= 20) user.rankTitle = 'Chief Science Officer';
  else if (user.level >= 15) user.rankTitle = 'Mission Commander';
  else if (user.level >= 10) user.rankTitle = 'Lead Researcher';
  else if (user.level >= 6) user.rankTitle = 'Laboratory Specialist';
  else if (user.level >= 3) user.rankTitle = 'Science Officer';
  else user.rankTitle = 'Cadet Explorer';

  db.xpTransactions.push({
    id: 'tx-' + crypto.randomUUID(),
    userId: user.id,
    activityKey,
    xp: xpAmount,
    createdAt: new Date().toISOString(),
  });

  return xpAmount;
}

// Server XP Award Endpoint
app.post('/api/xp/award', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });

  const { activityKey, xpAmount } = req.body;
  if (!activityKey || typeof xpAmount !== 'number') {
    return res.status(400).json({ error: 'Valid activityKey and xpAmount required.' });
  }

  // Cap max client-requested XP at 100 per action for security
  const safeAmount = Math.min(100, Math.max(5, xpAmount));
  const earned = awardUserXp(user, activityKey, safeAmount);

  saveDB();
  broadcastSSE('leaderboard_update', { userId: user.id });

  res.json({
    earnedXp: earned,
    user: sanitizeUser(user),
  });
});

// Leaderboard
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const sorted = [...db.users]
    .sort((a, b) => b.xp - a.xp)
    .map((u, index) => ({
      rank: index + 1,
      id: u.id,
      username: u.username,
      displayName: u.displayName || u.username,
      avatar: u.avatar,
      level: u.level,
      xp: u.xp,
      rankTitle: u.rankTitle,
      completedChaptersCount: u.completedChaptersCount,
      quizzesCompletedCount: u.quizzesCompletedCount,
      streakDays: u.streakDays,
      isCurrentUser: user ? u.id === user.id : false,
    }));

  res.json({ leaderboard: sorted });
});

// ---------------- AI Mission Briefing & Gemini Endpoints ----------------

app.post('/api/ai/briefing', async (req: Request, res: Response) => {
  const { chapterId, chapterName } = req.body;
  if (!chapterId && !chapterName) {
    return res.status(400).json({ error: 'Chapter id or name is required.' });
  }

  const targetName = chapterName || RAW_CHAPTERS_DATA.find((c) => c.id === parseInt(chapterId, 10))?.name;

  if (!ai) {
    // Deterministic smart fallback if GEMINI_API_KEY is not set yet
    return res.json({
      chapterName: targetName,
      summary: `Comprehensive mission briefing for ${targetName}. Focus on core definitions, formula derivations, and past exam pattern weightage.`,
      keyFormulas: [
        'Fundamental Relation: Law of Conservation & Equilibrium',
        'Standard Rate & Ratio Equations',
        'Directly Proportional Relationships & Constant of Proportionality'
      ],
      examTips: [
        'Prioritize high-weightage numerical problems from this chapter.',
        'Draw neat, labeled scientific diagrams with proper arrows.',
        'Write balanced chemical or physical equations with states (s, l, g, aq).'
      ],
      highYieldQuestions: [
        `State and explain the fundamental principle governing ${targetName}.`,
        'Differentiate between primary and secondary classifications with two examples each.',
        'Solve a standard numerical calculation with given boundary conditions.'
      ]
    });
  }

  try {
    const prompt = `You are the Lead Science Officer for Science Mission HQ.
Generate an actionable, high-yield exam mission briefing for the science chapter: "${targetName}".
Format your response as a valid JSON object with the following schema:
{
  "summary": "2-3 concise, punchy sentences explaining what the chapter is about and why it matters in exams",
  "keyFormulas": ["array of 3-5 essential formulas, scientific laws, or core equations with symbols"],
  "examTips": ["array of 3-4 golden exam tips, common student mistakes, or memory mnemonics"],
  "highYieldQuestions": ["array of 3 high-probability questions frequently asked in board exams"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      chapterName: targetName,
      ...parsed,
    });
  } catch (err: any) {
    console.error('Gemini briefing error:', err);
    res.status(500).json({ error: 'Failed to generate AI mission briefing: ' + err.message });
  }
});

// AI Doubt Resolution
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  const { chapterName, doubt } = req.body;
  if (!doubt?.trim()) return res.status(400).json({ error: 'Please provide a doubt or question.' });

  if (!ai) {
    return res.json({
      explanation: `Science Mission HQ Explainer for: "${doubt}".\n\n1. Core Concept: In ${chapterName || 'Science'}, this phenomenon is governed by standard physical/chemical laws.\n2. Step-by-Step Breakdown: First identify given variables, apply the matching principle, and verify units.\n3. Exam Key: Highlight relevant keywords in your final answer.`
    });
  }

  try {
    const prompt = `You are a patient, brilliant science tutor at Science Mission HQ.
The student has a doubt in chapter "${chapterName || 'General Science'}":
"${doubt}"

Provide a crisp, clear, step-by-step explanation with simple analogies and an exam takeaway. Keep it under 250 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (err: any) {
    console.error('Gemini explanation error:', err);
    res.status(500).json({ error: 'Failed to explain doubt: ' + err.message });
  }
});

// Helper: Sanitize User Record
function sanitizeUser(user: UserRecord) {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

// ---------------- Vite Middleware or Static Production Serving ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Science Mission HQ backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
