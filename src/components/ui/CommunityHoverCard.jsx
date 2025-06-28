import React, { useState } from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Button } from './button';
import { Skeleton } from './skeleton';
import { toast } from 'sonner';
import api from '@/api/api';
import VerifiedBadge from './verified-badge';
import NSFWBadge from './nsfw-badge';
import { Users, Calendar, Hash, MapPin } from 'lucide-react';

export default function CommunityHoverCard({ communityId, children }) {
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  const fetchCommunity = async () => {
    if (community || loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/communities/${communityId}`);
      setCommunity(res.data.data);
    } catch (e) {
      toast.error('Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!community) return;
    setJoining(true);
    try {
      if (community.isFollowing) {
        await api.delete(`/communities/${communityId}/leave`);
        setCommunity({ ...community, isFollowing: false, memberCount: Math.max(0, (community.memberCount || 1) - 1) });
        toast.success('Left community');
      } else {
        await api.post(`/communities/${communityId}/join`);
        setCommunity({ ...community, isFollowing: true, memberCount: (community.memberCount || 0) + 1 });
        toast.success('Joined community');
      }
    } catch (e) {
      toast.error('Failed to update membership');
    } finally {
      setJoining(false);
    }
  };

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger onMouseEnter={fetchCommunity} asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
        {loading || !community ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Banner */}
            {community.bannerUrl && (
              <div className="h-20 w-full relative overflow-hidden">
                <img 
                  src={community.bannerUrl} 
                  alt="Banner" 
                  className="object-cover w-full h-full" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Header with logo and basic info */}
            <div className="flex items-start gap-4 p-5 pb-3">
              <Avatar className={`h-16 w-16 border-2 border-white dark:border-black shadow-sm ${community.bannerUrl ? '-mt-8' : ''}`}>
                <AvatarImage src={community.logoUrl} />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-lg font-semibold">
                  {community.name?.charAt(0).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    c/{community.name}
                  </h3>
                  {community.isVerified && <VerifiedBadge size="small" />}
                  {community.isNsfw && <NSFWBadge />}
                </div>
                
                {community.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                    {community.description}
                  </p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{community.memberCount || 0}</span>
                    <span>members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">{community.postCount || 0}</span>
                    <span>posts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Community details */}
            <div className="px-5 pb-3 space-y-2">
              {community.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{community.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Created {community.createdAt ? new Date(community.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}</span>
              </div>
            </div>

            {/* Join/Leave button */}
            <div className="px-5 pb-4">
              <Button
                size="sm"
                variant={community.isFollowing ? 'outline' : 'default'}
                onClick={handleJoinLeave}
                disabled={joining}
                className={`w-full rounded-full font-medium ${
                  community.isFollowing 
                    ? 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900' 
                    : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                }`}
              >
                {joining ? '...' : community.isFollowing ? 'Joined' : 'Join Community'}
              </Button>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
} 