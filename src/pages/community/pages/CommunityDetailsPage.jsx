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
    
    const handleJoinLeave = async () => {
        if (!authUser) {
            toast.info("Please log in to join a community.");
            return navigate('/login');
        }

        // Prevent leaving the community from this button
        if (community.isFollowing) {
            toast.info("You are already a member of this community.");
            return;
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
                <div className="h-48 bg-muted border-b">
                    {community.bannerUrl && <img src={community.bannerUrl} alt={`${community.name} banner`} className="w-full h-full object-cover" />}
                </div>

                {/* Header */}
                <div className="bg-card">
                    <div className="container max-w-4xl mx-auto px-4">
                        <div className="flex items-end -mt-12">
                            <Avatar className="h-24 w-24 border-4 border-card">
                                <AvatarImage src={community.logoUrl} />
                                <AvatarFallback className="text-4xl">{community.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 py-4">
                                <h1 className="text-3xl font-bold">{community.name}</h1>
                                <p className="text-muted-foreground">c/{community.name}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                             <p className="text-muted-foreground">{community.memberCount || 0} members</p>
                             <div className="flex items-center gap-2">
                                {isOwner ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                                Admin Actions
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link to={`/edit-community/${community.id}`}>Edit Community</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-500 focus:text-red-500">
                                                Delete Community
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Button onClick={handleJoinLeave} disabled={isJoining || community.isFollowing}>
                                        {community.isFollowing ? "Joined" : "Join"}
                                    </Button>
                                )}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-card border-b">
                    <div className="container max-w-4xl mx-auto px-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="posts">Posts</TabsTrigger>
                                <TabsTrigger value="about">About</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="container max-w-4xl mx-auto px-4 py-6">
                    <Tabs value={activeTab} className="w-full">
                        <TabsContent value="posts" className="mt-0">
                            <CommunityPosts communityId={community.id} />
                        </TabsContent>

                        <TabsContent value="about" className="mt-0">
                            <div className="max-w-2xl">
                                <div className="space-y-6">
                                    {/* Description */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {community.description || "No description available for this community."}
                                        </p>
                                    </div>

                                    {/* Community Stats */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Community Stats</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-semibold">{community.memberCount || 0}</p>
                                                    <p className="text-sm text-muted-foreground">Members</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-semibold">
                                                        {new Date(community.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Created</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Topics */}
                                    {community.topics && community.topics.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">Topics</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {community.topics.map((topic, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {topic}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Community Settings */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Community Settings</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {community.isNsfw ? (
                                                        <Shield className="h-5 w-5 text-red-500" />
                                                    ) : (
                                                        <Shield className="h-5 w-5 text-green-500" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">NSFW Content</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {community.isNsfw ? "This community allows NSFW content" : "This community is family-friendly"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant={community.isNsfw ? "destructive" : "default"}>
                                                    {community.isNsfw ? "NSFW" : "Safe"}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {community.isPrivate ? (
                                                        <EyeOff className="h-5 w-5 text-orange-500" />
                                                    ) : (
                                                        <Eye className="h-5 w-5 text-green-500" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">Privacy</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {community.isPrivate ? "This is a private community" : "This is a public community"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant={community.isPrivate ? "secondary" : "default"}>
                                                    {community.isPrivate ? "Private" : "Public"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* College Info */}
                                    {community.collegeId && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">College</h3>
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-muted-foreground">
                                                    This community is associated with a college.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            <span className="font-bold"> c/{community.name} </span>
                            community and all of its data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
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