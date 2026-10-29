import { Chapter, StudentProfile, StudyNote, StudyRoom, ChatMessage, LeaderboardEntry } from '../types';

const TOKEN_KEY = 'science_hq_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = `Request failed: ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) errMsg = data.error;
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    return res.json();
  },

  // Auth API
  async register(data: { username: string; displayName?: string; email: string; password: string; avatar?: string }) {
    const res = await this.request<{ token: string; user: StudentProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  },

  async login(data: { identifier: string; password: string }) {
    const res = await this.request<{ token: string; user: StudentProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  },

  async resetPassword(data: { identifier: string; newPassword: string }) {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return this.request<{ user: StudentProfile }>('/api/auth/me');
  },

  async updateProfile(data: Partial<StudentProfile>) {
    return this.request<{ user: StudentProfile }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    this.setToken(null);
  },

  // Chapters API
  async getChapters() {
    return this.request<{ chapters: Chapter[] }>('/api/chapters');
  },

  async updateChapterProgress(chapterId: number, progress: Partial<Chapter>) {
    return this.request<{ chapterId: number; progress: Chapter; earnedXp: number; user: StudentProfile }>(
      `/api/chapters/${chapterId}/progress`,
      {
        method: 'POST',
        body: JSON.stringify(progress),
      }
    );
  },

  // Notes API
  async getNotes(params: { filter?: string; chapterId?: number; tag?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.filter) query.set('filter', params.filter);
    if (params.chapterId) query.set('chapterId', params.chapterId.toString());
    if (params.tag) query.set('tag', params.tag);
    if (params.search) query.set('search', params.search);

    const url = `/api/notes${query.toString() ? '?' + query.toString() : ''}`;
    return this.request<{ notes: StudyNote[] }>(url);
  },

  async createNote(data: Partial<StudyNote>) {
    return this.request<{ note: StudyNote; earnedXp: number; user: StudentProfile }>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNote(id: string, data: Partial<StudyNote>) {
    return this.request<{ note: StudyNote }>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteNote(id: string) {
    return this.request<{ message: string }>(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleLikeNote(id: string) {
    return this.request<{ likes: string[] }>(`/api/notes/${id}/like`, {
      method: 'POST',
    });
  },

  async toggleBookmarkNote(id: string) {
    return this.request<{ bookmarks: string[] }>(`/api/notes/${id}/bookmark`, {
      method: 'POST',
    });
  },

  async addNoteComment(noteId: string, content: string) {
    return this.request<{ comment: any }>(`/api/notes/${noteId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Rooms & Chat API
  async getRooms() {
    return this.request<{ rooms: StudyRoom[] }>('/api/rooms');
  },

  async createRoom(data: { name: string; description?: string; subjectFocus?: string; maxMembers?: number }) {
    return this.request<{ room: StudyRoom }>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async joinRoom(code: string) {
    return this.request<{ room: StudyRoom }>('/api/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async leaveRoom(roomId: string) {
    return this.request<{ message: string }>(`/api/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  },

  async getRoomMessages(roomId: string) {
    return this.request<{ messages: ChatMessage[] }>(`/api/rooms/${roomId}/messages`);
  },

  async sendRoomMessage(roomId: string, text: string) {
    return this.request<{ message: ChatMessage }>(`/api/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // XP & Leaderboard
  async awardXp(activityKey: string, xpAmount: number) {
    return this.request<{ earnedXp: number; user: StudentProfile }>('/api/xp/award', {
      method: 'POST',
      body: JSON.stringify({ activityKey, xpAmount }),
    });
  },

  async getLeaderboard() {
    return this.request<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');
  },

  // AI Assistant Endpoints
  async getChapterBriefing(chapterId: number, chapterName?: string) {
    return this.request<{
      chapterName: string;
      summary: string;
      keyFormulas: string[];
      examTips: string[];
      highYieldQuestions: string[];
    }>('/api/ai/briefing', {
      method: 'POST',
      body: JSON.stringify({ chapterId, chapterName }),
    });
  },

  async explainDoubt(chapterName: string, doubt: string) {
    return this.request<{ explanation: string }>('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ chapterName, doubt }),
    });
  },

  // Real-time EventSource helper
  subscribeToEvents(
    roomId: string | undefined,
    onEvent: (type: string, data: any) => void
  ): () => void {
    const token = this.getToken();
    const params = new URLSearchParams();
    if (roomId) params.set('roomId', roomId);
    if (token) params.set('token', token);

    const url = `/api/realtime/stream?${params.toString()}`;
    const eventSource = new EventSource(url);

    const eventNames = ['chat_message', 'new_note', 'update_note', 'delete_note', 'room_update', 'leaderboard_update'];
    eventNames.forEach((ev) => {
      eventSource.addEventListener(ev, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEvent(ev, data);
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      });
    });

    return () => {
      eventSource.close();
    };
  },
};
