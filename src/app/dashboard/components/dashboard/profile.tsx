import { Mail, Pencil, User } from 'lucide-react';

import type { UserProfile } from '../../types/dashboard';

interface ProfileProps {
  profile: UserProfile;
  onEdit?: () => void;
}

export function Profile({ profile, onEdit }: ProfileProps) {
  const xpPercent = Math.min(100, Math.round((profile.xp / profile.xpMax) * 100));

  return (
    <section
      className="rounded-lg border border-amber-900/60 p-6"
      style={{ background: 'linear-gradient(to bottom, #1d2127 0%, #0d0f11 100%)' }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-widest text-neutral-300">PROFILE</h2>
        <button
          onClick={onEdit}
          aria-label="Edit profile"
          className="text-neutral-400 transition-colors hover:text-neutral-200"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {/* Avatar */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-neutral-900">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-neutral-500" />
          )}
        </div>
      </div>

      {/* Name */}
      <p className="mb-8 text-center text-lg font-bold tracking-wide text-neutral-100">
        {profile.name}
      </p>

      {/* User ID / Email rows */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <User className="h-4 w-4 text-neutral-500" />
          <span>{profile.userId}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <Mail className="h-4 w-4 text-neutral-500" />
          <span>{profile.email}</span>
        </div>
      </div>

      {/* XP bar */}
      <div className="mt-auto">
        <div className="h-5 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#c1502e] to-[#e07a52] transition-all"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-neutral-400">
          {profile.xp}/{profile.xpMax}
        </p>
      </div>
    </section>
  );
}
