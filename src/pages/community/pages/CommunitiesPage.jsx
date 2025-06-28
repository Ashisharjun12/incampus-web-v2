import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI } from '@/api/api';
import { useAuthStore } from '@/store/authstore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { toast } from 'sonner';
import CreateCommunityForm from '@/pages/community/components/CreateCommunityForm.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import CommunityListItem from '@/pages/community/components/CommunityListItem.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import NSFWBadge from '@/components/ui/nsfw-badge';
import { SlidersHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

const CommunitiesPage = () => {
    const { authUser } = useAuthStore();
    
    const [communities, setCommunities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingCommunityId, setLoadingCommunityId] = useState(null);
    
    // State for dialogs
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingCommunity, setEditingCommunity] = useState(null);
    const [deletingCommunity, setDeletingCommunity] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' or 'myCollege'
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = { search: searchTerm };
            if (filter === 'myCollege') params.myCollege = true;
            const communitiesResponse = await communityAPI.getAll(params);

            if (communitiesResponse.data.success) {
                const sorted = communitiesResponse.data.data.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
                setCommunities(sorted);
            } else {
                toast.error(communitiesResponse.data.message || 'Failed to load communities.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while fetching data.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, filter]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleCommunitySaved = () => {
        setShowCreateDialog(false);
        setEditingCommunity(null);
        loadData(); // Refresh list after creation/update
    };

    const handleJoin = async (communityId) => {
        setLoadingCommunityId(communityId);
        try {
            await communityAPI.join(communityId);
            toast.success("Successfully joined community!");
            setCommunities(prev => prev.map(c => 
                c.id === communityId ? { ...c, isFollowing: true, memberCount: c.memberCount + 1 } : c
            ));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to join community.");
        } finally {
            setLoadingCommunityId(null);
        }
    };

    const handleLeave = async (communityId) => {
        setLoadingCommunityId(communityId);
        try {
            await communityAPI.leave(communityId);
            toast.success("Successfully left community.");
            setCommunities(prev => prev.map(c => 
                c.id === communityId ? { ...c, isFollowing: false, memberCount: c.memberCount - 1 } : c
            ));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to leave community.");
        } finally {
            setLoadingCommunityId(null);
        }
    };
    
    const handleEdit = (community) => {
        setEditingCommunity(community);
        setShowCreateDialog(true);
    };

    const handleDelete = async () => {
        if (!deletingCommunity) return;
        try {
            await communityAPI.delete(deletingCommunity.id);
            toast.success(`Community "c/${deletingCommunity.name}" deleted.`);
            setCommunities(prev => prev.filter(c => c.id !== deletingCommunity.id));
            setDeletingCommunity(null);
        } catch (error) {
             toast.error(error.response?.data?.message || "Failed to delete community.");
        }
    };


    const openCreateDialog = () => {
        setEditingCommunity(null);
        setShowCreateDialog(true);
    }

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-6">
                <div className="relative w-full flex-1 flex items-center gap-2">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                    <Input
                        placeholder="Search communities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Filter communities">
                                <SlidersHorizontal className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setFilter('all')}
                                className={filter === 'all' ? 'font-bold text-primary' : ''}
                            >
                                All Communities
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setFilter('myCollege')}
                                className={filter === 'myCollege' ? 'font-bold text-primary' : ''}
                                disabled={!authUser}
                            >
                                My College Communities
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="w-full sm:w-auto">
                    {authUser && <Button onClick={openCreateDialog} className="w-full sm:w-auto hidden sm:inline-flex">Create Community</Button>}
                    <CreateCommunityForm 
                        open={showCreateDialog} 
                        onOpenChange={setShowCreateDialog} 
                        onCommunitySaved={handleCommunitySaved} 
                        community={editingCommunity}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                         <div key={i} className="flex items-center gap-4 p-3">
                            <Skeleton className="h-8 w-6" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-grow space-y-2">
                               <Skeleton className="h-4 w-32" />
                               <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : communities.length === 0 ? (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold">No communities found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or create a new community.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {communities.map((community, index) => (
                        <CommunityListItem 
                            key={community.id} 
                            community={community} 
                            rank={index + 1}
                            isLoading={loadingCommunityId === community.id}
                            onJoin={handleJoin}
                            onLeave={handleLeave}
                            onEdit={handleEdit}
                            onDelete={(community) => setDeletingCommunity(community)}
                        />
                    ))}
                </div>
            )}
            
            {/* Floating Action Button for Mobile */}
            {authUser && (
                <Button 
                    onClick={openCreateDialog}
                    className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden z-50"
                    size="icon"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            )}
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingCommunity} onOpenChange={() => setDeletingCommunity(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the <strong>c/{deletingCommunity?.name}</strong> community and all of its data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CommunitiesPage;