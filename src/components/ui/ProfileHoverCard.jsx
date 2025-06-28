import React, { useState } from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Button } from './button';
import { Badge } from './badge';
import { Skeleton } from './skeleton';
import { toast } from 'sonner';
import { authAPI } from '@/api/api';
import { MapPin, Calendar, Users } from 'lucide-react';

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
    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    : profile?.gender === 'female'
      ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800'
      : 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger onMouseEnter={fetchProfile} asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
        {loading || !profile ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header with avatar and basic info */}
            <div className="flex items-start gap-4 p-5 pb-3">
              <Avatar className="h-16 w-16 border-2 border-white dark:border-black shadow-sm">
                <AvatarImage src={profile.avatarUrl || profile.googleAvatarUrl} />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-lg font-semibold">
                  {(profile.anonymousUsername || profile.name || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                    {profile.anonymousUsername || profile.name}
                  </h3>
                  {profile.gender && (
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 ${genderBadgeClass}`}>
                      {genderIcons[profile.gender] || genderIcons.other}
                      <span className="ml-1 capitalize">{profile.gender}</span>
                    </Badge>
                  )}
                </div>
                
                {profile.college && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {profile.college.logoUrl && (
                      <img 
                        src={profile.college.logoUrl} 
                        alt="College Logo" 
                        className="h-4 w-4 rounded-full object-cover" 
                      />
                    )}
                    <span className="truncate">{profile.college.name}</span>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio section */}
            {profile.bio && (
              <div className="px-5 pb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Stats section */}
            {profile.stats && (
              <div className="flex items-center gap-6 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{profile.stats.posts || 0}</span>
                  <span>posts</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{profile.stats.followers || 0}</span>
                  <span>followers</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{profile.stats.following || 0}</span>
                  <span>following</span>
                </div>
              </div>
            )}

            {/* Join date */}
            <div className="flex items-center gap-1 px-5 pb-4 text-xs text-gray-500 dark:text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}</span>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
} 