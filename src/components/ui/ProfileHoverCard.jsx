import React, { useState } from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Button } from './button';
import { Badge } from './badge';
import { Skeleton } from './skeleton';
import { toast } from 'sonner';
import { authAPI } from '@/api/api';

const genderIcons = {
  male: '♂',
  female: '♀',
  other: '⚧',
};

export default function ProfileHoverCard({ userId, children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (profile || loading) return;
    setLoading(true);
    try {
      const res = await authAPI.getProfileById(userId);
      setProfile(res.data.data);
    } catch (e) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const genderBadgeClass = profile?.gender === 'male'
    ? 'bg-blue-100 text-blue-700'
    : profile?.gender === 'female'
      ? 'bg-pink-100 text-pink-700'
      : 'bg-muted text-muted-foreground';

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger onMouseEnter={fetchProfile} asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-0 overflow-hidden">
        {loading || !profile ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : (
          <div className="bg-background flex flex-col items-center px-4 py-3">
            <Avatar className="h-12 w-12 border-2 border-background bg-white dark:bg-background mb-2">
              <AvatarImage src={profile.avatarUrl || profile.googleAvatarUrl} />
              <AvatarFallback>{profile.anonymousUsername?.[0] || profile.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-base text-center">{profile.anonymousUsername || profile.name}</span>
                {profile.gender && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${genderBadgeClass}`}>
                    {genderIcons[profile.gender] || genderIcons.other}
                    <span className="capitalize">{profile.gender}</span>
                  </span>
                )}
              </div>
              {profile.college && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5 justify-center">
                  {profile.college.logoUrl && (
                    <img src={profile.college.logoUrl} alt="College Logo" className="h-4 w-4 rounded-full" />
                  )}
                  <span>{profile.college.name}</span>
                </div>
              )}
            </div>
            {profile.bio && (
              <div className="pt-1 text-xs text-muted-foreground text-center w-full line-clamp-2">{profile.bio}</div>
            )}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
} 