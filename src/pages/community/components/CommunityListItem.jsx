import React from 'react';
import { Link } from 'react-router-dom';
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

// Helper to format large numbers
const formatMemberCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
};

const CommunityListItem = ({ community, rank, onJoin, onLeave, onEdit, onDelete, isLoading }) => {
    const { authUser } = useAuthStore();
    console.log("comms",community)
    
    const renderButtons = () => {
        if (!authUser) return null;

        if (community.isOwner) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(community)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(community)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        if (community.isFollowing) {
            return <Button variant="outline" size="sm" onClick={() => onLeave(community.id)} disabled={isLoading}>
                {isLoading ? 'Leaving...' : 'Leave'}
            </Button>;
        }

        return <Button variant="outline" size="sm" onClick={() => onJoin(community.id)} disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join'}
        </Button>;
    };
    
    return (
        <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
           <span className="font-bold text-lg w-6 shrink-0 text-center text-muted-foreground">{rank}</span>
           <Avatar className="h-10 w-10">
                <AvatarImage src={community.logoUrl} alt={`${community.name} logo`} />
                <AvatarFallback>{community.name?.charAt(0).toUpperCase()}</AvatarFallback>
           </Avatar>
           <div className="flex-grow overflow-hidden">
                <Link to={`/community/${community.id}`} className="font-semibold truncate hover:underline">
                    c/{community.name}
                    {community.isVerified && (
                        <VerifiedBadge size="default" className="ml-1" />
                    )}
                    {community.isNsfw && (
                        <NSFWBadge size="small" className="ml-1" />
                    )}
                </Link>
                <p className="text-sm text-muted-foreground truncate">{community.description || "No description"}</p>
                <p className="text-sm text-muted-foreground">{formatMemberCount(community.memberCount || 0)} members</p>
           </div>
           <div className="ml-auto shrink-0">
                {renderButtons()}
           </div>
        </div>
    );
};

export default CommunityListItem; 