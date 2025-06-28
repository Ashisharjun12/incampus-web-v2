import React, { useState } from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Button } from './button';
import { Skeleton } from './skeleton';
import { toast } from 'sonner';
import api from '@/api/api';
import VerifiedBadge from './verified-badge';
import NSFWBadge from './nsfw-badge';

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
      <HoverCardContent className="w-72 p-0 overflow-hidden">
        {loading || !community ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : (
          <div className="bg-background flex flex-col items-center px-4 py-3">
            {community.bannerUrl && (
              <div className="h-16 w-full bg-muted relative mb-[-32px] rounded-t-md overflow-hidden">
                <img src={community.bannerUrl} alt="Banner" className="object-cover w-full h-full" />
              </div>
            )}
            <Avatar className="h-14 w-14 border-2 border-background bg-white dark:bg-background mb-2 mt-2 z-10">
              <AvatarImage src={community.logoUrl} />
              <AvatarFallback>{community.name?.[0]?.toUpperCase() || 'C'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center w-full mt-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-base text-center">c/{community.name}</span>
                {community.isVerified && <VerifiedBadge size="small" />}
                {community.isNsfw && <NSFWBadge />}
              </div>
              <div className="text-muted-foreground text-xs mb-0.5 line-clamp-2 text-center w-full">{community.description}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5 justify-center">
                <span>{community.memberCount || 0} members</span>
              </div>
            </div>
            <div className="pt-2 flex justify-center w-full">
              <Button
                size="sm"
                variant={community.isFollowing ? 'outline' : 'default'}
                onClick={handleJoinLeave}
                disabled={joining}
                className="rounded-full px-5"
              >
                {joining ? '...' : community.isFollowing ? 'Joined' : 'Join'}
              </Button>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
} 