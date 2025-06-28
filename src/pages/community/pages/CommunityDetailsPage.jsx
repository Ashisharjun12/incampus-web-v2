import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { communityAPI } from '@/api/api';
import { useAuthStore } from '@/store/authstore';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Shield, Eye, EyeOff } from 'lucide-react';
import PostCard from '@/pages/posts/components/PostCard';
import { postAPI } from '@/api/api';
import SuspensionGuard from '@/components/SuspensionGuard';

const CommunityDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authUser } = useAuthStore();

    const [community, setCommunity] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');

    const isOwner = authUser?.id === community?.createdById;

    const fetchCommunityDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await communityAPI.getById(id);
            if (response.data.success) {
                setCommunity(response.data.data);
            } else {
                toast.error("Community not found.");
                navigate('/communities');
            }
        } catch (error) {
            toast.error("Failed to fetch community details.");
            navigate('/communities');
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchCommunityDetails();
    }, [fetchCommunityDetails]);
    
    const handleJoin = async () => {
        if (!authUser) {
            toast.info("Please log in to join a community.");
            return navigate('/login');
        }
        setIsJoining(true);
        try {
            const response = await communityAPI.join(id);
            if (response.data.success) {
                toast.success(response.data.message);
                setCommunity(prev => ({
                    ...prev,
                    isFollowing: true,
                    memberCount: prev.memberCount + 1,
                }));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!authUser) {
            toast.info("Please log in to leave a community.");
            return navigate('/login');
        }
        setIsJoining(true);
        try {
            const response = await communityAPI.leave(id);
            if (response.data.success) {
                toast.success(response.data.message);
                setCommunity(prev => ({
                    ...prev,
                    isFollowing: false,
                    memberCount: Math.max(0, prev.memberCount - 1),
                }));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
        } finally {
            setIsJoining(false);
        }
    };
    
     const handleDelete = async () => {
        setShowDeleteConfirm(false);
        try {
            const response = await communityAPI.delete(id);
            if (response.data.success) {
                toast.success("Community deleted successfully.");
                navigate('/communities');
            } else {
                toast.error(response.data.message || "Failed to delete community.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
        }
    };

    const CommunityPosts = ({ communityId }) => {
        const [posts, setPosts] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            setLoading(true);
            postAPI.getByCommunity(communityId)
                .then(res => {
                    setPosts(res.data.data || []);
                })
                .catch(() => setPosts([]))
                .finally(() => setLoading(false));
        }, [communityId]);

        if (loading) {
            return <div className="py-8 text-center text-muted-foreground">Loading posts...</div>;
        }
        if (!posts.length) {
            return (
                <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Be the first to share something in c/{communityId}
                        </p>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        );
    };

    if (isLoading) {
        return <div className="container max-w-4xl mx-auto px-4 py-8"><CommunityDetailsSkeleton /></div>;
    }

    if (!community) {
        return null; 
    }

    return (
        <>
            <div className="w-full">
                {/* Banner */}
                <div className="h-40 sm:h-56 w-full bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                    {community.bannerUrl && <img src={community.bannerUrl} alt={`${community.name} banner`} className="w-full h-full object-cover" />}
                </div>

                {/* Header */}
                <div className="bg-white dark:bg-black">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="flex items-end -mt-14 sm:-mt-20">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-black shadow-lg bg-white dark:bg-black">
                                <AvatarImage src={community.logoUrl} />
                                <AvatarFallback className="text-4xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{community.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 py-4 flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">c/{community.name}</h1>
                                    {community.isVerified && <Badge variant="outline" className="text-xs border-blue-400 text-blue-600">Verified</Badge>}
                                    {community.isNsfw && <Badge variant="destructive" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">NSFW</Badge>}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{community.description || 'No description'}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                                    <span><Users className="inline h-4 w-4 mr-1" />{community.memberCount || 0} members</span>
                                    <span><Calendar className="inline h-4 w-4 mr-1" />Created {community.createdAt ? new Date(community.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}</span>
                                </div>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                {community.isFollowing ? (
                                    <SuspensionGuard action="leave communities">
                                        <Button
                                            onClick={handleLeave}
                                            disabled={isJoining}
                                            className="rounded-full px-6 py-2 bg-white dark:bg-black text-black dark:text-white font-semibold text-base shadow-none border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                                        >
                                            {isJoining ? 'Leaving...' : 'Leave'}
                                        </Button>
                                    </SuspensionGuard>
                                ) : (
                                    <SuspensionGuard action="join communities">
                                        <Button
                                            onClick={handleJoin}
                                            disabled={isJoining}
                                            className="rounded-full px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-semibold text-base shadow-none border-none disabled:opacity-50"
                                        >
                                            {isJoining ? 'Joining...' : 'Join'}
                                        </Button>
                                    </SuspensionGuard>
                                )}
                                {isOwner && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => navigate(`/community/${id}/edit`)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs and Posts */}
                <div className="max-w-3xl mx-auto px-4 mt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="flex gap-2 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-4">
                            <TabsTrigger value="posts" className="rounded-lg px-4 py-2 text-base font-medium data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">Posts</TabsTrigger>
                            <TabsTrigger value="info" className="rounded-lg px-4 py-2 text-base font-medium data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">Community Info</TabsTrigger>
                        </TabsList>
                        <TabsContent value="posts">
                            <CommunityPosts communityId={community.id} />
                        </TabsContent>
                        <TabsContent value="info">
                            {/* Community Info/About Section */}
                            <div className="mt-2 space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">About this community</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {community.description || "No description available for this community."}
                                    </p>
                                </div>
                                {/* Stats */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Users className="h-4 w-4" />
                                        <span>{community.memberCount || 0} members</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                        <span>Created {community.createdAt ? new Date(community.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}</span>
                                    </div>
                                </div>
                                {/* Topics */}
                                {community.topics && community.topics.length > 0 && (
                                    <div>
                                        <h4 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">Topics</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {community.topics.map((topic, idx) => (
                                                <Badge key={idx} variant="secondary">{topic}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* NSFW/Privacy */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Shield className={`h-4 w-4 ${community.isNsfw ? 'text-red-500' : 'text-green-500'}`} />
                                        <span>{community.isNsfw ? 'NSFW allowed' : 'Family-friendly'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        {community.isPrivate ? <EyeOff className="h-4 w-4 text-orange-500" /> : <Eye className="h-4 w-4 text-green-500" />}
                                        <span>{community.isPrivate ? 'Private community' : 'Public community'}</span>
                                    </div>
                                </div>
                                {/* College Info */}
                                {community.collegeId && (
                                    <div>
                                        <h4 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">College</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span>This community is associated with a college.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 dark:text-white">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                            This will permanently delete the <strong>c/{community?.name}</strong> community and all of its data. This action cannot be undone.
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
        </>
    );
};

const CommunityDetailsSkeleton = () => (
    <div>
        <Skeleton className="h-48 w-full" />
        <div className="bg-card">
             <div className="container max-w-4xl mx-auto px-4">
                <div className="flex items-end -mt-12">
                    <Skeleton className="h-24 w-24 rounded-full border-4 border-card" />
                    <div className="ml-4 py-4 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                 <div className="flex justify-between items-center py-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        </div>
    </div>
);


export default CommunityDetailsPage; 