import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AvatarPicker } from './AvatarPicker';
import { api } from '../services/api';
import { X, LogIn, UserPlus, KeyRound, CheckCircle2, Orbit } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, playSound } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');

  // Form states
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('astronaut-cyan');
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!identifier.trim() || !password) {
          throw new Error('Please enter your username/email and password.');
        }
        await login(identifier.trim(), password);
        onClose();
      } else if (mode === 'register') {
        if (!username.trim() || !email.trim() || !password) {
          throw new Error('Username, email, and password are required.');
        }
        await register(username.trim(), email.trim(), password, displayName.trim(), avatar);
        onClose();
      } else if (mode === 'reset') {
        if (!identifier.trim() || !newPassword) {
          throw new Error('Please enter your username/email and a new password.');
        }
        const res = await api.resetPassword({ identifier: identifier.trim(), newPassword });
        setSuccessMsg(res.message);
        setTimeout(() => setMode('login'), 2500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
      playSound('alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-800/80 bg-slate-950 shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-900 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600/30 to-blue-900/40 border border-cyan-500/50">
              <Orbit className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {mode === 'login' ? 'Cadet Authentication' : mode === 'register' ? 'Join Science Mission HQ' : 'Reset Password'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">Real-time sync across all your devices</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-900 bg-slate-900/30 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2.5 text-center transition-all ${
              mode === 'login' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 bg-cyan-950/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2.5 text-center transition-all ${
              mode === 'register' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 bg-cyan-950/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('reset');
              setError('');
            }}
            className={`flex-1 py-2.5 text-center transition-all ${
              mode === 'reset' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 bg-cyan-950/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          {error && (
            <div className="p-3 rounded-xl border border-rose-900 bg-rose-950/50 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl border border-emerald-900 bg-emerald-950/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' && (
            <>
              <div>
                <label className="block text-slate-400 mb-1">Username or Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. quantum_cadet or cadet@study.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-400 mb-1">Choose Mission Avatar</label>
                <AvatarPicker selectedId={avatar} onSelect={setAvatar} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Username (Unique) *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. galileo_42"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Student Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@school.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password (min 6 chars) *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </>
          )}

          {mode === 'reset' && (
            <>
              <div>
                <label className="block text-slate-400 mb-1">Your Registered Username or Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. galileo_42"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">New Password (min 6 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all"
            >
              {loading
                ? 'Authenticating...'
                : mode === 'login'
                ? 'Access Mission Deck'
                : mode === 'register'
                ? 'Create Cadet Profile (+50 XP)'
                : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
