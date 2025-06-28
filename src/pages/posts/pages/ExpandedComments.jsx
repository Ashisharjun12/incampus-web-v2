import React, { useEffect, useState } from 'react';
import { commentAPI } from '@/api/api';
import CommentItem from '@/pages/comments/components/CommentItem';
import MentionInput from '@/components/ui/MentionInput';
import GifPicker from '@/pages/comments/components/GifPicker';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authstore';

// Helper function to build comment tree from flat array
function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    
    // Create a map of all comments
    comments.forEach(comment => {
        if (!comment || !comment.id) return;
        map[comment.id] = { ...comment, replies: [] };
    });
    
    // Build the tree structure
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

// Helper function to recursively get all descendant comment IDs
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

const ExpandedComments = ({ postId }) => {
  const [comments, setComments] = useState([]); // Flat array for easier manipulation
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newCommentMedia, setNewCommentMedia] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const { authUser } = useAuthStore();

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await commentAPI.getByPost(postId, { limit: 50 });
        setComments(res.data.data || []);
        setHasMore((res.data.data || []).length > 15);
      } catch (e) {
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  // Handler for optimistic UI updates
  const handleDelete = (commentId) => {
    setComments(prev => {
      const descendantIds = getAllDescendantIds(prev, commentId);
      return prev.filter(c => c.id !== commentId && !descendantIds.includes(c.id));
    });
  };

  const handleEdit = () => {
    // Reload comments to get updated data
    commentAPI.getByPost(postId).then(res => setComments(res.data.data || []));
  };

  const handleReply = (parentId, newReply) => {
    setComments(prev => [...prev, newReply]);
  };

  const handleLike = () => {
    // Like updates are handled by the like store, no need to reload
  };

  // Handle new comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim() && newCommentMedia.length === 0) return;
    if (!authUser) {
      toast.error('Please login to comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await commentAPI.create({
        postId: postId,
        content: newComment,
        media: newCommentMedia
      });
      
      const newCommentData = response.data?.data;
      if (newCommentData) {
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        setNewCommentMedia([]);
        toast.success('Comment posted!');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle GIF selection
  const handleGifSelect = (gif) => {
    setNewCommentMedia([gif]);
  };

  // Handle media removal
  const handleRemoveMedia = (index) => {
    setNewCommentMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Show more comments
  const handleShowMore = () => {
    setVisibleCount(prev => prev + 15);
    setHasMore(comments.length > visibleCount + 15);
  };

  // Build comment tree for rendering
  const commentTree = buildCommentTree(comments);
  const visibleComments = commentTree.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="mb-2 text-gray-900 dark:text-white font-semibold">Comments</div>
      
      {loading ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">Loading comments...</div>
      ) : visibleComments.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">No comments yet.</div>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={comment.replies || []}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onReply={handleReply}
              onLike={handleLike}
              setComments={setComments}
            />
          ))}
          
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={handleShowMore}
                className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Show more comments
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Comment Form */}
      {authUser && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
          <MentionInput
            value={newComment}
            onChange={setNewComment}
            placeholder="Write a comment..."
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
            submitText="Post"
            showGifButton={true}
            onGifClick={() => setShowGifPicker(true)}
            media={newCommentMedia}
            onRemoveMedia={handleRemoveMedia}
          />
        </div>
      )}

      {/* GIF Picker */}
      <GifPicker 
        open={showGifPicker} 
        onOpenChange={setShowGifPicker}
        onSelect={handleGifSelect}
      />
    </div>
  );
};

export default ExpandedComments; 