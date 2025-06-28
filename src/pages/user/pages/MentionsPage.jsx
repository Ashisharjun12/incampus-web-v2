import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mentionAPI } from '@/api/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, 
    Check, 
    CheckCheck, 
    MessageCircle, 
    FileText,
    Loader2 
} from 'lucide-react';
import ProfileHoverCard from '@/components/ui/ProfileHoverCard';

const MentionsPage = () => {
    const [mentions, setMentions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingRead, setMarkingRead] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadMentions();
    }, []);

    const loadMentions = async (pageNum = 1) => {
        try {
            setLoading(true);
            const response = await mentionAPI.getMyMentions({ page: pageNum, limit: 20 });
            if (response.data.success) {
                const newMentions = response.data.data;
                if (pageNum === 1) {
                    setMentions(newMentions);
                } else {
                    setMentions(prev => [...prev, ...newMentions]);
                }
                setHasMore(newMentions.length === 20);
            }
        } catch (error) {
            toast.error('Failed to load mentions');
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            setMarkingRead(true);
            await mentionAPI.markAllMentionsAsRead();
            setMentions(prev => prev.map(mention => ({ ...mention, isRead: true })));
            toast.success('All mentions marked as read');
        } catch (error) {
            toast.error('Failed to mark mentions as read');
        } finally {
            setMarkingRead(false);
        }
    };

    const markAsRead = async (mentionId) => {
        try {
            await mentionAPI.markMentionsAsRead([mentionId]);
            setMentions(prev => 
                prev.map(mention => 
                    mention.id === mentionId ? { ...mention, isRead: true } : mention
                )
            );
        } catch (error) {
            toast.error('Failed to mark mention as read');
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadMentions(nextPage);
    };

    const getContentIcon = (contentType) => {
        switch (contentType) {
            case 'post':
                return <FileText className="h-4 w-4" />;
            case 'comment':
                return <MessageCircle className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getContentText = (mention) => {
        const username = mention.mentionedBy?.profile?.anonymousUsername || mention.mentionedBy?.name;
        switch (mention.contentType) {
            case 'post':
                return `${username} mentioned you in a post`;
            case 'comment':
                return `${username} mentioned you in a comment`;
            default:
                return `${username} mentioned you`;
        }
    };

    const handleMentionClick = (mention) => {
        // Mark as read if not already read
        if (!mention.isRead) {
            markAsRead(mention.id);
        }
        
        // Navigate to the content
        if (mention.contentType === 'post') {
            navigate(`/post/${mention.contentId}`);
        } else if (mention.contentType === 'comment') {
            // Navigate to the post with comment focus
            navigate(`/post/${mention.contentId}#comment-${mention.contentId}`);
        }
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

    if (loading && mentions.length === 0) {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Mentions</h1>
                {mentions.some(m => !m.isRead) && (
                    <Button 
                        onClick={markAllAsRead} 
                        disabled={markingRead}
                        variant="outline"
                        size="sm"
                    >
                        {markingRead ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <CheckCheck className="h-4 w-4 mr-2" />
                        )}
                        Mark all as read
                    </Button>
                )}
            </div>

            {mentions.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No mentions yet</h3>
                        <p className="text-muted-foreground">
                            When someone mentions you in a post or comment, it will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {mentions.map((mention) => (
                        <Card 
                            key={mention.id} 
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                !mention.isRead ? 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20' : ''
                            }`}
                            onClick={() => handleMentionClick(mention)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <ProfileHoverCard userId={mention.mentionedBy?.id}>
                                        <Avatar className="h-10 w-10 flex-shrink-0 cursor-pointer">
                                            <AvatarImage 
                                                src={mention.mentionedBy?.profile?.avatarUrl || mention.mentionedBy?.googleAvatarUrl} 
                                            />
                                            <AvatarFallback className="bg-muted text-muted-foreground">
                                                {mention.mentionedBy?.profile?.anonymousUsername?.charAt(0).toUpperCase() || 
                                                 mention.mentionedBy?.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </ProfileHoverCard>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ProfileHoverCard userId={mention.mentionedBy?.id}>
                                                <span className="font-semibold hover:underline cursor-pointer">
                                                    {mention.mentionedBy?.profile?.anonymousUsername || mention.mentionedBy?.name}
                                                </span>
                                            </ProfileHoverCard>
                                            {!mention.isRead && (
                                                <Badge variant="secondary" className="text-xs">
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {getContentText(mention)}
                                        </p>
                                        
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {getContentIcon(mention.contentType)}
                                            <span>{formatDate(mention.createdAt)}</span>
                                        </div>
                                    </div>
                                    
                                    {!mention.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(mention.id);
                                            }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {hasMore && (
                        <div className="text-center pt-4">
                            <Button 
                                onClick={loadMore} 
                                variant="outline"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Load more
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MentionsPage; 