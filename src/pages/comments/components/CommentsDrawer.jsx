import React, { useState, useEffect, useCallback } from 'react';
import { 
    Drawer, 
    DrawerContent, 
    DrawerHeader, 
    DrawerTitle 
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, X } from 'lucide-react';
import { commentAPI } from '@/api/api';
import { useLikeStore } from '@/store/likestore';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { toast } from 'sonner';
import SuspensionGuard from '@/components/SuspensionGuard';

// Helper: build a tree from flat comments array
function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    comments.forEach(comment => {
        if (!comment || !comment.id) return; // skip undefined/null/invalid
        map[comment.id] = { ...comment, replies: [] };
    });
    comments.forEach(comment => {
        if (!comment || !comment.id) return;
        if (comment.parentId && map[comment.parentId]) {
            map[comment.parentId].replies.push(map[comment.id]);
        } else {
            roots.push(map[comment.id]);
        }
    });
    return roots;
}

// Helper: recursively get all descendant comment IDs
function getAllDescendantIds(comments, parentId) {
    const ids = [];
    function findReplies(id) {
        comments.forEach(c => {
            if (c.parentId === id) {
                ids.push(c.id);
                findReplies(c.id);
            }
        });
    }
    findReplies(parentId);
    return ids;
}

// Mark comment and all replies as deleting (for use outside component)
function markCommentAndRepliesDeleting(setComments, id) {
    setComments(prev => {
        const descendantIds = getAllDescendantIds(prev, id);
        return prev.map(c =>
            c.id === id || descendantIds.includes(c.id)
                ? { ...c, isDeleting: true }
                : c
        );
    });
}

const CommentsDrawer = ({ postId, open, onOpenChange, commentCount = 0 }) => {
    const [comments, setComments] = useState([]); // flat array
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { initializeLikeData, initializeBatchLikeData } = useLikeStore();

    // Load comments from API
    const loadComments = async () => {
        if (!postId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await commentAPI.getByPost(postId, { limit: 50 });
            if (response.data.success) {
                const commentsData = response.data.data;
                setComments(commentsData);
                // Initialize like data for all comments
                const likeDataItems = commentsData.map(comment => ({
                    contentType: 'comment',
                    contentId: comment.id
                }));
                await initializeLikeData('post', postId);
                await initializeBatchLikeData(likeDataItems);
            } else {
                setError('Failed to load comments');
            }
        } catch (error) {
            setError('Failed to load comments');
            console.error('Error loading comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadComments();
        }
    }, [open, postId]);

    // Local update helpers
    const updateCommentInState = useCallback((id, updater) => {
        setComments(prev => prev.map(c => c.id === id ? { ...c, ...updater(c) } : c));
    }, []);

    const addReplyToState = useCallback((parentId, reply) => {
        setComments(prev => [...prev, reply]);
    }, []);

    const addCommentToState = useCallback((comment) => {
        if (!comment || !comment.id) return;
        setComments(prev => [comment, ...prev]);
    }, []);

    // Recursively delete comment and all replies
    const deleteCommentInState = useCallback((id) => {
        setComments(prev => {
            const descendantIds = getAllDescendantIds(prev, id);
            return prev.filter(c => c.id !== id && !descendantIds.includes(c.id));
        });
    }, []);

    // Handlers for CommentItem
    const handleLike = (commentId, updater) => {
        updateCommentInState(commentId, updater);
    };
    const handleEdit = (commentId, updatedFields) => {
        updateCommentInState(commentId, () => updatedFields);
    };
    const handleDelete = (commentId) => {
        deleteCommentInState(commentId);
    };
    const handleReply = (parentId, reply) => {
        addReplyToState(parentId, reply);
    };

    // When a new top-level comment is created (optimistic)
    const handleCommentCreated = (comment, opts = {}) => {
        // opts: { optimistic, tempId, onServerResponse }
        if (opts.optimistic) {
            addCommentToState(comment);
            opts.onServerResponse && opts.onServerResponse({ tempId: comment.id });
        } else if (opts.tempId && comment) {
            updateCommentInState(opts.tempId, () => comment);
        }
    };

    // Build tree for rendering
    const commentTree = buildCommentTree(comments);
    const commentCountDisplay = commentTree.length;

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[90vh] max-h-[90vh] overflow-hidden bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl">
                <DrawerHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 bg-white dark:bg-black">
                    <div className="flex items-center justify-between">
                        <DrawerTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
                            <MessageCircle className="h-5 w-5 text-gray-500" />
                            Comments
                        </DrawerTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DrawerHeader>
                <div className="flex flex-col h-full min-h-0">
                    {/* Comments List */}
                    <div className="flex-1 min-h-0 overflow-y-auto py-4 px-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mb-4">
                                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                                </div>
                                <Button 
                                    onClick={loadComments}
                                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : commentTree.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="p-6 bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                                    <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <MessageCircle className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No comments yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to share your thoughts!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                {commentTree.map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        replies={comment.replies}
                                        onLike={handleLike}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onReply={handleReply}
                                        depth={0}
                                        setComments={setComments}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Comment Form */}
                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-black rounded-b-2xl">
                        <SuspensionGuard action="write comments">
                            <CommentForm
                                postId={postId}
                                onCommentCreated={handleCommentCreated}
                                placeholder="Share your thoughts..."
                            />
                        </SuspensionGuard>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default CommentsDrawer;
export { markCommentAndRepliesDeleting }; 