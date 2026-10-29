import React, { useState, useEffect, useRef } from 'react';
import { StudyRoom, ChatMessage } from '../types';
import { AvatarIcon } from './AvatarPicker';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Send, Users, Copy, Check, LogOut, Shield, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

interface SquadChatProps {
  room: StudyRoom;
  onLeaveRoom: () => void;
}

export const SquadChat: React.FC<SquadChatProps> = ({ room, onLeaveRoom }) => {
  const { user, playSound } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.getRoomMessages(room.id);
      setMessages(res.messages || []);
    } catch (e) {
      console.error('Error fetching room messages:', e);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to SSE updates for this room
    const unsubscribe = api.subscribeToEvents(room.id, (event, data) => {
      if (event === 'chat_message' && data.roomId === room.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
        playSound('click');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [room.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    if (!user) {
      alert('Please sign in to send messages to the squad.');
      return;
    }

    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      await api.sendRoomMessage(room.id, textToSend);
      playSound('click');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    playSound('complete');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] rounded-2xl border border-purple-900/60 bg-slate-950/80 shadow-2xl overflow-hidden">
      {/* Room Header */}
      <div className="p-4 border-b border-slate-900 bg-slate-900/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-950/70 border border-purple-700/60 text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">{room.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono line-clamp-1">{room.description}</p>
          </div>
        </div>

        {/* Right side controls: Invite code, Members toggle, Leave */}
        <div className="flex items-center gap-2">
          {/* Room Code Badge */}
          <button
            type="button"
            onClick={handleCopyCode}
            title="Click to copy room code"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-700/60 bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 text-xs font-mono font-bold transition-all"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>CODE: {room.code}</span>
          </button>

          {/* Members Toggle */}
          <button
            type="button"
            onClick={() => setShowMembers(!showMembers)}
            className={`p-2 rounded-xl border transition-all ${
              showMembers
                ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title="Toggle Members List"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Leave Room */}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-all"
            title="Leave Room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body: Messages & Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Feed */}
        <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
              <MessageSquare className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-slate-400 font-bold mb-1">Squad Mission Communications Channel</p>
              <p>No messages yet. Share a question, study tip, or discuss an exam topic!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = user && msg.senderId === user.id;
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <AvatarIcon avatarId={msg.senderAvatar} size="sm" />
                  <div
                    className={`max-w-[78%] rounded-2xl p-3 text-xs sm:text-sm font-sans shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-700/60 text-cyan-100 rounded-tr-none'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[10px] font-mono opacity-80">
                      <span className="font-bold">{msg.senderName}</span>
                      <span>•</span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Members Drawer */}
        {showMembers && (
          <div className="w-64 border-l border-slate-900 bg-slate-950/95 p-3 flex flex-col space-y-3 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 px-1">
              <span>SQUAD CADETS ({room.members?.length || 0})</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {room.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-900 bg-slate-900/50"
                >
                  <div className="relative">
                    <AvatarIcon avatarId={member.avatar} size="sm" />
                    {member.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-200 truncate">{member.displayName}</span>
                      {member.role === 'host' && (
                        <Shield className="w-3 h-3 text-amber-400 flex-shrink-0" title="Squad Host" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400">
                      LV {member.level || 1} • {member.xp || 0} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message Input Footer */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-900 bg-slate-950 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={user ? `Message ${room.name}...` : 'Please sign in to send messages...'}
          disabled={!user || sending}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-sans"
        />
        <button
          type="submit"
          disabled={!user || !inputText.trim() || sending}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
