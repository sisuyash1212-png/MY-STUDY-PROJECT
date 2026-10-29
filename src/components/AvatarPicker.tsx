import React from 'react';
import { User, Sparkles, Shield, Compass, Cpu, Atom, Rocket } from 'lucide-react';

export interface AvatarOption {
  id: string;
  name: string;
  icon: React.ElementType;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'astronaut-cyan',
    name: 'Cyber Cadet',
    icon: Rocket,
    bgGradient: 'from-cyan-900/60 to-blue-900/60',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-400',
  },
  {
    id: 'astronaut-purple',
    name: 'Quantum Theorist',
    icon: Atom,
    bgGradient: 'from-purple-900/60 to-indigo-900/60',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
  },
  {
    id: 'astronaut-emerald',
    name: 'Bio-Matrix Scout',
    icon: Sparkles,
    bgGradient: 'from-emerald-900/60 to-teal-900/60',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
  },
  {
    id: 'astronaut-amber',
    name: 'Cosmic Engineer',
    icon: Cpu,
    bgGradient: 'from-amber-900/60 to-orange-900/60',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
  },
  {
    id: 'astronaut-rose',
    name: 'Shield Specialist',
    icon: Shield,
    bgGradient: 'from-rose-900/60 to-pink-900/60',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-400',
  },
  {
    id: 'astronaut-blue',
    name: 'Star Navigator',
    icon: Compass,
    bgGradient: 'from-blue-900/60 to-cyan-900/60',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
  },
];

export function getAvatarInfo(avatarId?: string): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
}

export const AvatarIcon: React.FC<{ avatarId?: string; className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({
  avatarId,
  className = '',
  size = 'md',
}) => {
  const opt = getAvatarInfo(avatarId);
  const Icon = opt.icon;

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs border',
    md: 'w-9 h-9 text-sm border',
    lg: 'w-12 h-12 text-base border-2',
    xl: 'w-16 h-16 text-xl border-2',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${opt.bgGradient} ${opt.borderColor} ${opt.textColor} shadow-lg shadow-black/40 flex-shrink-0 ${sizeClasses} ${className}`}
    >
      <Icon size={iconSizes} />
    </div>
  );
};

export const AvatarPicker: React.FC<{ selectedId?: string; onSelect: (id: string) => void }> = ({
  selectedId,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {AVATAR_OPTIONS.map((opt) => {
        const isSelected = (selectedId || 'astronaut-cyan') === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
              isSelected
                ? `${opt.borderColor} bg-cyan-950/40 ring-2 ring-cyan-500/50 shadow-md shadow-cyan-500/20 scale-105`
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40 opacity-80 hover:opacity-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${opt.bgGradient} border ${opt.borderColor} ${opt.textColor} flex items-center justify-center mb-1.5`}
            >
              <Icon size={20} />
            </div>
            <span className="text-[11px] font-medium text-slate-300 text-center line-clamp-1">{opt.name}</span>
          </button>
        );
      })}
    </div>
  );
};
