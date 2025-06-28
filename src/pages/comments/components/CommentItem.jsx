// Force cache clear - CommentItem component
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
    Heart, 
    MessageCircle, 
    MoreHorizontal,
    Edit,
    Trash2,
    Reply,
    Image,
    Loader2,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authstore';
import { useLikeStore } from '@/store/likestore';
import { commentAPI } from '@/api/api';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import GifPicker from './GifPicker';
import ProfileHoverCard from '@/components/ui/ProfileHoverCard';
import MentionInput from '@/components/ui/MentionInput';
import { useNavigate } from 'react-router-dom';



const CommentItem = ({ 
    comment, 
    replies = [],
    onReply, 
    onEdit, 
    onDelete, 
    onLike, 
    depth = 0,
    setComments
}) => {
    const { authUser } = useAuthStore();
    const { 
        isLiked, 
        getLikeCount, 
        toggleLike, 
        isPending,
        initializeLikeData 
    } = useLikeStore();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [editContent, setEditContent] = useState(comment.content);
    const [replyMedia, setReplyMedia] = useState([]);
    const [editMedia, setEditMedia] = useState(comment.media || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const isOwner = authUser && comment.author?.id === authUser.userId;
    const maxDepth = 3; // Maximum nesting depth

    // Initialize like data for this comment
    useEffect(() => {
        initializeLikeData('comment', comment.id);
    }, [comment.id, initializeLikeData]);

    const liked = isLiked('comment', comment.id);
    const likeCount = getLikeCount('comment', comment.id);
    const isLikePending = isPending('comment', comment.id);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const handleLike = async () => {
        if (!authUser) {
            toast.error('Please login to like comments');
            return;
        }

        try {
            await toggleLike('comment', comment.id);
            // No need for success toast since the UI updates optimistically
            onLike?.();
        } catch (error) {
            toast.error('Failed to update like');
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim() && replyMedia.length === 0) return;
        setIsSubmitting(true);
        try {
            const response = await commentAPI.create({
                postId: comment.postId,
                content: replyContent,
                media: replyMedia,
                parentId: comment.id
            });
            const newReply = response.data?.data;
            setReplyContent('');
            setReplyMedia([]);
            setShowReplyForm(false);
            toast.success('Reply posted!');
            if (newReply && onReply) onReply(comment.id, newReply);
        } catch (error) {
            toast.error('Failed to post reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim() && editMedia.length === 0) return;
        
        setIsSubmitting(true);
        try {
            await commentAPI.edit(comment.id, {
                content: editContent,
                media: editMedia
            });
            
            setShowEditForm(false);
            toast.success('Comment updated!');
            onEdit?.();
        } catch (error) {
            toast.error('Failed to update comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setShowDeleteDialog(false);
        setIsDeleting(true);
        onDelete?.(comment.id); // Instantly remove from UI
        try {
            await commentAPI.delete(comment.id); // Call backend in background
            // toast.success('Comment deleted');
        } catch (error) {
            setIsDeleting(false);
            toast.error('Failed to delete comment');
            // Optionally: restore comment in state here
        }
    };

    const addGifToReply = (gif) => {
        setReplyMedia([gif]);
    };

    const addGifToEdit = (gif) => {
        setEditMedia([gif]);
    };

    const removeMedia = (index, isEdit = false) => {
        if (isEdit) {
            setEditMedia(editMedia.filter((_, i) => i !== index));
        } else {
            setReplyMedia(replyMedia.filter((_, i) => i !== index));
        }
    };

    return (
        <div className={cn(
            "flex items-start gap-3 py-3 group relative border-0 border-b border-gray-100 dark:border-gray-800",
            depth > 0 && "ml-6 pl-4 border-l-2 border-gray-100 dark:border-gray-800",
            (comment.isPending || comment.isDeleting) && "opacity-60"
        )}>
            {/* Avatar and thread line */}
            <div className="flex flex-col items-center mr-2">
                <Avatar className="h-9 w-9 flex-shrink-0 cursor-pointer border border-gray-200 dark:border-gray-800 bg-white dark:bg-black"
                    onClick={e => { e.stopPropagation(); navigate(`/profile/${comment.author?.id}`); }}>
                    <AvatarImage src={comment.author?.profile?.avatarUrl || comment.author?.googleAvatarUrl} />
                    <AvatarFallback className="bg-gray-200 text-gray-600 font-bold">
                        {comment.author?.profile?.anonymousUsername?.charAt(0).toUpperCase() || comment.author?.name?.charAt(0).toUpperCase() || comment.author?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 w-px bg-gray-200 dark:bg-gray-800 mt-1" style={{ minHeight: 40 }} />
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <ProfileHoverCard userId={comment.author?.id}>
                        <span className="font-semibold hover:underline cursor-pointer text-gray-900 dark:text-white text-sm"
                            onClick={e => { e.stopPropagation(); navigate(`/profile/${comment.author?.id}`); }}>
                            {comment.author?.profile?.anonymousUsername ? `@${comment.author.profile.anonymousUsername}` : (comment.author?.name || comment.author?.username || 'Unknown User')}
                        </span>
                    </ProfileHoverCard>
                    <span className="text-gray-400 text-xs">{formatDate(comment.createdAt)}</span>
                    {comment.isEdited && (
                        <span className="text-gray-400 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">edited</span>
                    )}
                </div>
                <div className="space-y-2">
                    {isDeleting ? (
                        <span className="text-red-500 font-semibold">Deleting...</span>
                    ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-white"
                            dangerouslySetInnerHTML={{
                                __html: comment.content.replace(/@(\w+)/g, '<span class="text-blue-500 font-medium hover:underline cursor-pointer" data-username="$1">@$1</span>')
                            }}
                            onClick={(e) => {
                                if (e.target.dataset.username) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/profile/${e.target.dataset.username}`);
                                }
                            }}
                        />
                    )}
                    {/* Media content */}
                    {!isDeleting && comment.media && comment.media.length > 0 && (
                        <div className="space-y-2 mt-2">
                            {comment.media.map((media, index) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={media.url} 
                                        alt="Media" 
                                        className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 object-cover" 
                                        style={{ maxHeight: '300px' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-4 mt-2 text-gray-400">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 h-auto hover:text-red-500 transition-colors text-xs",
                            liked && "text-red-500"
                        )}
                        onClick={(e) => { e.stopPropagation(); handleLike(); }}
                        disabled={isLikePending}
                    >
                        {isLikePending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                        )}
                        <span className="font-medium">{likeCount}</span>
                    </Button>
                    {depth < maxDepth && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1.5 px-2 py-1 h-auto hover:text-blue-500 transition-colors text-xs"
                            onClick={(e) => { e.stopPropagation(); setShowReplyForm(!showReplyForm); }}
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="font-medium">Reply</span>
                        </Button>
                    )}
                    {replies.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1.5 px-2 py-1 h-auto hover:text-gray-900 transition-colors text-xs"
                            onClick={(e) => { e.stopPropagation(); setShowReplies(v => !v); }}
                        >
                            <span className="font-medium">{showReplies ? 'Hide' : 'Show'} {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}</span>
                        </Button>
                    )}
                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEditForm(true); }} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                {/* Reply form and edit form remain unchanged */}
                {showReplyForm && (
                    <div className="mt-3">
                        <MentionInput
                            value={replyContent}
                            onChange={setReplyContent}
                            placeholder="Write a reply..."
                            onSubmit={handleReply}
                            isSubmitting={isSubmitting}
                            submitText="Reply"
                            showGifButton={true}
                            onGifClick={() => setShowGifPicker(true)}
                            media={replyMedia}
                            onRemoveMedia={(index) => removeMedia(index)}
                        />
                    </div>
                )}
                {showEditForm && (
                    <div className="mt-3 space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Edit your comment..."
                            className="min-h-[80px] resize-none bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 rounded-md"
                        />
                        {editMedia.length > 0 && (
                            <div className="space-y-2">
                                {editMedia.map((media, index) => (
                                    <div key={index} className="relative">
                                        <img 
                                            src={media.url} 
                                            alt="GIF" 
                                            className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 object-cover"
                                            style={{ maxHeight: '200px' }}
                                        />
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm"
                                            onClick={() => removeMedia(index, true)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setShowGifPicker(true); }}
                                className="flex items-center gap-1"
                            >
                                <Image className="h-4 w-4" />
                                GIF
                            </Button>
                            <div className="flex-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setShowEditForm(false); }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                                disabled={isSubmitting || (!editContent.trim() && editMedia.length === 0)}
                            >
                                {isSubmitting ? 'Updating...' : 'Update'}
                            </Button>
                        </div>
                    </div>
                )}
                {/* Replies: show directly below, indented, when showReplies is true */}
                {showReplies && replies.length > 0 && (
                    <div className="mt-2 space-y-0">
                        {replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                replies={reply.replies || []}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onLike={onLike}
                                depth={depth + 1}
                                setComments={setComments}
                            />
                        ))}
                    </div>
                )}
            </div>
            {/* GifPicker, Delete Dialog, and replies remain unchanged */}
            <GifPicker 
                open={showGifPicker} 
                onOpenChange={setShowGifPicker}
                onSelect={showEditForm ? addGifToEdit : addGifToReply}
            />
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Delete Comment?</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-700 dark:text-gray-300">This action cannot be undone. Are you sure you want to delete this comment?</p>
                    <DialogFooter>
                        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(false); }}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CommentItem; 