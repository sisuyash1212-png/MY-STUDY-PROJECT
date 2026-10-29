import React, { useState } from 'react';
import { StudyRoom } from '../types';
import { SquadChat } from '../components/SquadChat';
import { AvatarIcon } from '../components/AvatarPicker';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  LogIn,
  KeyRound,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  Radio,
  X,
} from 'lucide-react';

interface SquadsViewProps {
  rooms: StudyRoom[];
  selectedRoom: StudyRoom | null;
  onSelectRoom: (room: StudyRoom | null) => void;
  onCreateRoom: (data: { name: string; description?: string; subjectFocus?: string; maxMembers?: number }) => Promise<void>;
  onJoinRoom: (code: string) => Promise<void>;
  onLeaveRoom: (roomId: string) => Promise<void>;
}

export const SquadsView: React.FC<SquadsViewProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
}) => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Form states
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [roomFocus, setRoomFocus] = useState('Physics & Chemistry Focus');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Room name is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onCreateRoom({
        name: roomName.trim(),
        description: roomDesc.trim(),
        subjectFocus: roomFocus,
      });
      setShowCreateModal(false);
      setRoomName('');
      setRoomDesc('');
    } catch (err: any) {
      setError(err.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter a 6-character room code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onJoinRoom(joinCode.trim().toUpperCase());
      setShowJoinModal(false);
      setJoinCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  // If a room is currently active and selected, render SquadChat directly!
  if (selectedRoom) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onSelectRoom(null)}
          className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1.5"
        >
          ← Back to Squad Rooms Directory
        </button>
        <SquadChat
          room={selectedRoom}
          onLeaveRoom={async () => {
            await onLeaveRoom(selectedRoom.id);
            onSelectRoom(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            Real Multiplayer Study Rooms & Live Chat
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Collaborate in real time with your actual squad. Real member rosters, live chat, and shared progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-700/80 bg-purple-950/60 hover:bg-purple-900 text-purple-300 font-bold text-xs sm:text-sm transition-all"
          >
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>Join with Code</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Squad Room</span>
          </button>
        </div>
      </div>

      {/* Active Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const isMember = user && room.members?.some((m) => m.id === user.id);
          const isHost = user && room.hostId === user.id;

          return (
            <div
              key={room.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-purple-600/60 shadow-lg transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-purple-950 border border-purple-800 text-purple-300">
                    CODE: {room.code}
                  </span>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {room.members?.length || 1} online
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {room.name}
                </h3>

                <p className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                  {room.description}
                </p>

                <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{room.subjectFocus}</span>
                </div>
              </div>

              {/* Members Avatars preview */}
              <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                <div className="flex items-center -space-x-2 overflow-hidden">
                  {room.members?.slice(0, 4).map((m) => (
                    <AvatarIcon key={m.id} avatarId={m.avatar} size="sm" className="ring-2 ring-slate-950" />
                  ))}
                  {(room.members?.length || 0) > 4 && (
                    <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center justify-center ring-2 ring-slate-950">
                      +{room.members.length - 4}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectRoom(room)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono transition-all"
                >
                  <span>{isMember ? 'Enter Room' : 'Join Room'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-purple-800 bg-slate-950 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Create New Squad Room
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-rose-900 bg-rose-950/50 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Squad Room Name *</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Science Board Toppers 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mission / Description</label>
                <textarea
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  placeholder="e.g. Daily revision of NCERT high weightage chapters, formula sharing, and doubt solving."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subject Focus</label>
                <select
                  value={roomFocus}
                  onChange={(e) => setRoomFocus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Physics & Chemistry Focus">Physics & Chemistry Focus</option>
                  <option value="Biology & Life Sciences">Biology & Life Sciences</option>
                  <option value="State Board Full Syllabus">State Board Full Syllabus</option>
                  <option value="NCERT & Common Core">NCERT & Common Core</option>
                  <option value="Formula Sheets & Quick Derivations">Formula Sheets & Quick Derivations</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Launch Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-purple-800 bg-slate-950 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-400" />
                Join Squad via Code
              </h3>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-rose-900 bg-rose-950/50 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Enter 6-Character Squad Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. QUANTM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-cyan-300 font-mono text-center tracking-widest text-lg font-bold placeholder-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Connect to Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
