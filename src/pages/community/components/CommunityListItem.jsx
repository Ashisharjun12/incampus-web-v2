import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import { useAuthStore } from '@/store/authstore';
import VerifiedBadge from '@/components/ui/verified-badge';
import NSFWBadge from '@/components/ui/nsfw-badge';
import SuspensionGuard from '@/components/SuspensionGuard';

// Helper to format large numbers
const formatMemberCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
};

const CommunityListItem = ({ community, rank, onJoin, onLeave, onEdit, onDelete, isLoading }) => {
    const { authUser } = useAuthStore();
    const navigate = useNavigate();

    const renderButtons = () => {
        if (!authUser) return null;

        if (community.isOwner) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit(community); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onDelete(community); }} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        if (community.isFollowing) {
            return <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); onLeave(community.id); }} disabled={isLoading}>
                {isLoading ? 'Leaving...' : 'Leave'}
            </Button>;
        }

        return (
            <SuspensionGuard action="join communities">
                <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); onJoin(community.id); }} disabled={isLoading}>
                    {isLoading ? 'Joining...' : 'Join'}
                </Button>
            </SuspensionGuard>
        );
    };
    
    return (
        <div
            className="flex items-center gap-3 py-3 px-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0 bg-transparent cursor-pointer group transition"
            onClick={() => navigate(`/community/${community.id}`)}
            tabIndex={0}
            role="button"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/community/${community.id}`); }}
        >
           <span className="font-bold text-base w-6 shrink-0 text-center text-gray-400 dark:text-gray-600">{rank}</span>
           <Avatar className="h-10 w-10">
                <AvatarImage src={community.logoUrl} alt={`${community.name} logo`} />
                <AvatarFallback>{community.name?.charAt(0).toUpperCase()}</AvatarFallback>
           </Avatar>
           <div className="flex-grow min-w-0">
                <span className="font-semibold truncate text-gray-900 dark:text-white group-hover:underline">
                    c/{community.name}
                    {community.isVerified && (
                        <VerifiedBadge size="default" className="ml-1" />
                    )}
                    {community.isNsfw && (
                        <NSFWBadge size="small" className="ml-1" />
                    )}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{community.description || "No description"}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">{formatMemberCount(community.memberCount || 0)} members</p>
           </div>
           <div className="ml-auto shrink-0 flex items-center gap-1">
                {renderButtons()}
           </div>
        </div>
    );
};

export default CommunityListItem; 