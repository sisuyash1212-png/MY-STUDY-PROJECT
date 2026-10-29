import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: StudentProfile | null;
  loading: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: 'click' | 'levelUp' | 'complete' | 'alert') => void;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (username: string, email: string, pass: string, displayName?: string, avatar?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<StudentProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  awardXp: (activityKey: string, xpAmount: number) => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Web Audio API synthesized futuristic sound effects (zero external audio file dependency)
function playFuturisticSound(type: 'click' | 'levelUp' | 'complete' | 'alert') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'complete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'levelUp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.2);
      osc.frequency.linearRampToValueAtTime(1320, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(250, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // ignore audio context failures
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('science_sound_enabled') !== 'false';
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('science_sound_enabled', String(next));
      return next;
    });
  };

  const playSound = (type: 'click' | 'levelUp' | 'complete' | 'alert') => {
    if (soundEnabled) {
      playFuturisticSound(type);
    }
  };

  const refreshUser = async () => {
    if (!api.getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      api.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login({ identifier, password: pass });
    setUser(res.user);
    playSound('complete');
  };

  const register = async (username: string, email: string, pass: string, displayName?: string, avatar?: string) => {
    const res = await api.register({ username, email, password: pass, displayName, avatar });
    setUser(res.user);
    playSound('levelUp');
  };

  const logout = () => {
    api.logout();
    setUser(null);
    playSound('click');
  };

  const updateProfile = async (data: Partial<StudentProfile>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
    playSound('click');
  };

  const awardXp = async (activityKey: string, xpAmount: number): Promise<number> => {
    if (!user) return 0;
    try {
      const res = await api.awardXp(activityKey, xpAmount);
      if (res.earnedXp > 0) {
        setUser(res.user);
        playSound('levelUp');
      }
      return res.earnedXp;
    } catch {
      return 0;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        soundEnabled,
        toggleSound,
        playSound,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        awardXp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
