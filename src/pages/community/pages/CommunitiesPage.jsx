import React, { useState, useEffect, useCallback } from 'react';

import { communityAPI } from '@/api/api';
import { useAuthStore } from '@/store/authstore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { toast } from 'sonner';
import CreateCommunityForm from '@/pages/community/components/CreateCommunityForm.jsx';
import { Skeleton } from '@/components/ui/skeleton';
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
import VerifiedBadge from '@/components/ui/verified-badge';
import { Search, SlidersHorizontal, Plus, Building2, Users, Hash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import SuspensionGuard from '@/components/SuspensionGuard';
import CommunityListItem from '../components/CommunityListItem';

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
        <div className="min-h-screen w-full bg-white dark:bg-black">
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Communities</h1>
                    <p className="text-gray-600 dark:text-gray-400">Discover and join communities that interest you</p>
                </div>

                {/* Search, Filter, and Create Community in one row */}
                <div className="flex items-center gap-2 mb-6 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search communities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 text-base bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-0 rounded-xl shadow-none"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-11 w-11 flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 shadow-none"
                                aria-label="Filter communities"
                            >
                                <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg">
                            <DropdownMenuItem
                                onClick={() => setFilter('all')}
                                className={`flex items-center gap-2 p-3 rounded-md mx-1 my-1 ${
                                    filter === 'all' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                                }`}
                            >
                                <Building2 className="h-4 w-4" />
                                All Communities
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setFilter('myCollege')}
                                className={`flex items-center gap-2 p-3 rounded-md mx-1 my-1 ${
                                    filter === 'myCollege' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                                }`}
                                disabled={!authUser}
                            >
                                <Users className="h-4 w-4" />
                                My College Communities
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {authUser && (
                        <SuspensionGuard action="create communities">
                            <Button 
                                onClick={openCreateDialog} 
                                className="h-11 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl font-medium shadow-none whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Create Community</span>
                            </Button>
                        </SuspensionGuard>
                    )}
                </div>

                {/* Communities List: one row per community, full row clickable */}
                {isLoading ? (
                    <div className="flex flex-col gap-0">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 py-3 px-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0 bg-transparent">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : communities.length === 0 ? (
                    <div className="text-center py-16">
                        <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No communities found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or create a new community.</p>
                        {authUser && (
                            <SuspensionGuard action="create communities">
                                <Button onClick={openCreateDialog} className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Community
                                </Button>
                            </SuspensionGuard>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-0">
                        {communities.map((community, index) => (
                            <CommunityListItem
                                key={community.id}
                                community={community}
                                rank={index + 1}
                                onJoin={handleJoin}
                                onLeave={handleLeave}
                                onEdit={handleEdit}
                                onDelete={c => setDeletingCommunity(c)}
                                isLoading={loadingCommunityId === community.id}
                            />
                        ))}
                    </div>
                )}
                
                {/* Floating Action Button for Mobile */}
                {authUser && (
                    <SuspensionGuard action="create communities">
                        <Button 
                            onClick={openCreateDialog}
                            className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden z-50 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                            size="icon"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </SuspensionGuard>
                )}
                
                {/* Create Community Modal */}
                <SuspensionGuard action="create communities">
                    <CreateCommunityForm 
                        open={showCreateDialog} 
                        onOpenChange={setShowCreateDialog} 
                        onCommunitySaved={handleCommunitySaved} 
                        community={editingCommunity}
                    />
                </SuspensionGuard>
                
                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!deletingCommunity} onOpenChange={() => setDeletingCommunity(null)}>
                    <AlertDialogContent className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-white">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                This will permanently delete the <strong>c/{deletingCommunity?.name}</strong> community and all of its data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default CommunitiesPage;