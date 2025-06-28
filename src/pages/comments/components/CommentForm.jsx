import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authstore';
import { commentAPI } from '@/api/api';
import { toast } from 'sonner';
import GifPicker from './GifPicker';
import { emojiData } from './EmojiData';
import ProfileHoverCard from '@/components/ui/ProfileHoverCard';
import MentionInput from '@/components/ui/MentionInput';

const CommentForm = ({ postId, onCommentCreated, removeCommentFromState, placeholder = "Write a comment..." }) => {
    const { authUser } = useAuthStore();
    const [content, setContent] = useState('');
    const [media, setMedia] = useState([]);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() && media.length === 0) return;
        setIsSubmitting(true);
        const tempId = 'temp-' + Date.now();
        const optimisticComment = {
            id: tempId,
            content: content.trim(),
            media,
            author: authUser,
            createdAt: new Date().toISOString(),
            isPending: true,
            postId,
        };
        onCommentCreated?.(optimisticComment, { optimistic: true });
        setContent('');
        setMedia([]);
        try {
            const response = await commentAPI.create({
                postId,
                content: optimisticComment.content,
                media: optimisticComment.media
            });
            const realComment = response.data?.data;
            if (realComment) {
                onCommentCreated?.(realComment, { tempId });
            } else {
                removeCommentFromState?.(tempId);
                toast.error('Failed to post comment');
            }
        } catch (error) {
            removeCommentFromState?.(tempId);
            toast.error('Failed to post comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addGif = (gif) => {
        setMedia([gif]);
    };

    const removeMedia = (index) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    return (
        <div className="border-t border-border/50 pt-2 pb-1 bg-background">
            {/* Emoji bar */}
            <div className="w-full overflow-x-auto flex gap-2 py-2 px-1 scrollbar-hide border-t border-border/30 bg-background">
                {emojiData.map((emoji, idx) => (
                    <button
                        type="button"
                        key={idx}
                        className="text-2xl bg-transparent border-none focus:outline-none"
                        onClick={() => setContent(prev => prev + emoji)}
                        tabIndex={-1}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            
            {/* Input row */}
            <div className="flex items-start gap-2 px-1 py-2 bg-background border-t border-border/30">
                <ProfileHoverCard userId={authUser?.userId}>
                    <Avatar className="h-8 w-8 flex-shrink-0 cursor-pointer">
                        <AvatarImage src={authUser?.avatarUrl || authUser?.googleAvatarUrl} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {authUser?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </ProfileHoverCard>
                
                <div className="flex-1">
                    <MentionInput
                        value={content}
                        onChange={setContent}
                        placeholder={placeholder}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        submitText="Post"
                        showGifButton={true}
                        onGifClick={() => setShowGifPicker(true)}
                        media={media}
                        onRemoveMedia={removeMedia}
                        className="min-h-[36px]"
                    />
                </div>
            </div>

            {/* GIF Picker */}
            <GifPicker 
                open={showGifPicker} 
                onOpenChange={setShowGifPicker}
                onSelect={addGif}
            />
        </div>
    );
};

export default CommentForm; 