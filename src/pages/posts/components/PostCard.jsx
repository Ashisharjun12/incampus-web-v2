import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Button } from '@/components/ui/button';

import { 
    Heart, 
    MessageCircle, 
    Share2, 
    MoreHorizontal,
    Hash,
    Shield,
    Image as ImageIcon,
    Video as VideoIcon,
    Play,
    Edit as EditIcon,
    Trash2,
    Bookmark,
    Flag,
    Loader2,
    Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authstore';
import { useSavedPostStore } from '@/store/savedpoststore';
import { useLikeStore } from '@/store/likestore';
import { postAPI } from '@/api/api';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ProfileHoverCard from '@/components/ui/ProfileHoverCard';
import CommunityHoverCard from '@/components/ui/CommunityHoverCard';
import CommentsDrawer from '../../comments/components/CommentsDrawer';
import PostImageCarousel from './PostImageCarousel';
import ShareModal from '@/components/ui/ShareModal';

const PostCard = ({ post, onLike, onComment, onShare, onDelete }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAllText, setShowAllText] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareCount, setShareCount] = useState(post.shareCount || 0);
    
    const { authUser } = useAuthStore();
    const { isPostSaved, savePost, unsavePost } = useSavedPostStore();
    const { 
        isLiked, 
        getLikeCount, 
        toggleLike, 
        isPending,
        initializeLikeData 
    } = useLikeStore();
    
    const isOwner = authUser && post.author && post.author.id && authUser.userId && post.author.id === authUser.userId;
    const navigate = useNavigate();
    const saved = isPostSaved(post.id);

    // Initialize like data for this post
    useEffect(() => {
        initializeLikeData('post', post.id);
    }, [post.id, initializeLikeData]);

    const liked = isLiked('post', post.id);
    const likeCount = getLikeCount('post', post.id);
    const isLikePending = isPending('post', post.id);

    const extractHashtags = (caption) => {
        if (!caption) return [];
        const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
        return caption.match(hashtagRegex) || [];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const renderCaption = (caption) => {
        if (!caption) return null;
        
        // Extract hashtags and mentions
        const hashtags = extractHashtags(caption);
        const mentions = caption.match(/@(\w+)/g) || [];
        
        let content = caption;
        
        // Replace hashtags with styled spans
        hashtags.forEach(tag => {
            content = content.replace(tag, `<span class="text-blue-500 font-medium">${tag}</span>`);
        });
        
        // Replace mentions with styled spans
        mentions.forEach(mention => {
            content = content.replace(mention, `<span class="text-blue-500 font-medium hover:underline cursor-pointer" data-username="${mention.slice(1)}">${mention}</span>`);
        });
        
        // Show 'Show more' if caption has more than 18 words
        const words = caption.split(/\s+/);
        const shouldTruncate = words.length > 18 && !showAllText;
        const displayText = shouldTruncate ? words.slice(0, 18).join(' ') + '...' : content;
        
        return (
            <div className="space-y-2">
                <p 
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                        __html: shouldTruncate ? 
                            displayText
                                .replace(/#[\w\u0590-\u05ff]+/g, `<span class="text-blue-500 font-medium">$&</span>`)
                                .replace(/@(\w+)/g, `<span class="text-blue-500 font-medium hover:underline cursor-pointer" data-username="$1">@$1</span>`) 
                            : content
                    }}
                    onClick={(e) => {
                        // Handle mention clicks
                        if (e.target.dataset.username) {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/profile/${e.target.dataset.username}`);
                        }
                    }}
                />
                {shouldTruncate && (
                    <Button
                        variant="link"
                        size="sm"
                        className="text-xs text-blue-500 p-0 h-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowAllText(true);
                        }}
                    >
                        Show more
                    </Button>
                )}
            </div>
        );
    };

    const renderMedia = () => {
        if (!post.images || post.images.length === 0) return null;
        return <PostImageCarousel images={post.images} />;
    };

    // Dummy handlers for share, save, report
    const handleShare = async () => {
        setShowShareModal(true);
        try {
            const res = await postAPI.share(post.id);
            if (res.data && res.data.success) {
                setShareCount(res.data.shareCount);
            }
        } catch (e) {
            // ignore error, don't block modal
        }
    };
    const handleSaveToggle = async () => {
        setSaving(true);
        try {
            if (saved) {
                await unsavePost(post.id);
                toast.success('Post unsaved!');
            } else {
                await savePost(post.id);
                toast.success('Post saved!');
            }
        } catch (error) {
            toast.error('Failed to update saved status.');
        } finally {
            setSaving(false);
        }
    };
    const handleReport = () => {
        toast.success('Post reported!');
    };

    const handleDelete = async () => {
      try {
        await postAPI.delete(post.id);
        toast.success('Post deleted');
        setShowDeleteDialog(false);
        onDelete?.();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete post');
      }
    };

    const handleCommentClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowComments(true);
    };

    const handleLike = async () => {
        if (!authUser) {
            toast.error('Please login to like posts');
            return;
        }

        try {
            await toggleLike('post', post.id);
            // No need for success toast since the UI updates optimistically
        } catch (error) {
            toast.error('Failed to update like');
        }
    };

    // Helper to format counts (e.g., 1k, 2.5k, 1m)
    function formatCount(num) {
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + 'm';
        if (num >= 1_000) return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + 'k';
        return num;
    }

    return (
        <div className="pb-6 mb-2">
            <div className="flex items-start gap-3">
                {/* Author Avatar and thread line */}
                {post.author && (
                    <div className="flex flex-col items-center mr-2">
                        <Avatar 
                            className="h-11 w-11 flex-shrink-0 cursor-pointer border border-gray-200 dark:border-gray-800 bg-white dark:bg-black"
                            onClick={e => {
                                e.stopPropagation();
                                navigate(`/profile/${post.author?.id}`);
                            }}
                        >
                            <AvatarImage src={post.author.avatarUrl} />
                            <AvatarFallback className="bg-gray-200 text-gray-600 font-bold">
                                {post.author.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-sm">
                            <ProfileHoverCard userId={post.author?.id}>
                                <span
                                    className="font-semibold hover:underline cursor-pointer"
                                    onClick={e => {
                                        e.stopPropagation();
                                        navigate(`/profile/${post.author?.id}`);
                                    }}
                                >
                                    {post.author?.username || 'Unknown User'}
                                </span>
                            </ProfileHoverCard>
                            <div className="text-gray-400 flex items-center gap-1">
                                <span>in</span>
                                <Avatar className="h-4 w-4">
                                    <AvatarImage src={post.community?.logoUrl} alt={post.community?.name} />
                                    <AvatarFallback className="text-[9px]">
                                        {post.community?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <CommunityHoverCard communityId={post.community?.id}>
                                    <span
                                        className="hover:underline cursor-pointer"
                                        onClick={e => {
                                            e.stopPropagation();
                                            navigate(`/community/${post.community?.id}`);
                                        }}
                                    >
                                        c/{post.community?.name || 'unknown'}
                                    </span>
                                </CommunityHoverCard>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">{formatDate(post.createdAt)}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={e => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="min-w-[220px] rounded-xl py-2 shadow-xl bg-background divide-y divide-border"
                          >
                            {isOwner ? (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/edit/${post.id}`);
                                  }}
                                  className="flex items-center gap-3 px-5 py-3 text-base font-medium rounded-none w-full"
                                >
                                  <EditIcon className="h-5 w-5" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteDialog(true);
                                  }}
                                  className="flex items-center gap-3 px-5 py-3 text-base font-medium rounded-none w-full text-red-600"
                                >
                                  <Trash2 className="h-5 w-5" /> Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare();
                                  }}
                                  className="flex items-center gap-3 px-5 py-3 text-base font-medium rounded-none w-full"
                                >
                                  <Upload className="h-5 w-5" /> Share
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveToggle();
                                  }}
                                  className="flex items-center gap-3 px-5 py-3 text-base font-medium rounded-none w-full"
                                >
                                  <Bookmark className="h-5 w-5" /> {saved ? 'Unsave' : 'Save'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReport();
                                  }}
                                  className="flex items-center gap-3 px-5 py-3 text-base font-medium rounded-none w-full text-red-600"
                                >
                                  <Flag className="h-5 w-5" /> Report
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare();
                                  }}
                                  className="flex items-center gap-3 px-5 py-3 text-base font-medium rounded-none w-full"
                                >
                                  <Share2 className="h-5 w-5" /> Share
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveToggle();
                                  }}
                                  className="flex items-center gap-3 px-5 py-3 text-base font-medium rounded-none w-full"
                                >
                                  <Bookmark className="h-5 w-5" /> {saved ? 'Unsave' : 'Save'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReport();
                                  }}
                                  className="flex items-center gap-3 px-5 py-3 text-base font-medium rounded-none w-full text-red-600"
                                >
                                  <Flag className="h-5 w-5" /> Report
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {/* Content - Clickable area for navigation */}
                    <div 
                        className="space-y-2 cursor-pointer"
                        onClick={() => navigate(`/post/${post.id}`)}
                    >
                        {renderCaption(post.caption)}
                        {renderMedia()}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-4 text-gray-400">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "flex items-center gap-2 p-0 h-auto hover:text-red-500 transition-colors text-lg",
                                liked && "text-red-500"
                            )}
                            onClick={e => { e.stopPropagation(); handleLike(); }}
                            disabled={isLikePending}
                        >
                            {isLikePending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                            )}
                            <span className="text-sm">{formatCount(likeCount)}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 p-0 h-auto hover:text-blue-500 transition-colors text-lg"
                            onClick={handleCommentClick}
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm">{formatCount(post.commentCount ?? 0)}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 p-0 h-auto hover:text-yellow-500 transition-colors text-lg"
                            onClick={e => { e.stopPropagation(); handleShare(); }}
                        >
                            <Upload className="h-5 w-5" />
                            <span className="text-sm">{formatCount(shareCount)}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "flex items-center gap-2 p-0 h-auto hover:text-purple-500 transition-colors text-lg",
                                saved && "text-primary"
                            )}
                            onClick={e => { e.stopPropagation(); handleSaveToggle(); }}
                            disabled={saving}
                            aria-label={saved ? 'Unsave post' : 'Save post'}
                        >
                            <Bookmark className={cn("h-5 w-5", saved ? "fill-current" : "")}/>
                        </Button>
                    </div>
                </div>
            </div>
            {/* Comments Drawer */}
            <CommentsDrawer
                postId={post.id}
                open={showComments}
                onOpenChange={setShowComments}
                commentCount={post.commentCount || 0}
            />
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Are you sure you want to delete this post?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <ShareModal
                open={showShareModal}
                onClose={() => setShowShareModal(false)}
                url={window.location.origin + '/post/' + post.id}
                title={post.caption}
            />
        </div>
    );
};

export default PostCard; 