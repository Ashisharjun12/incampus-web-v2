import React, { useEffect } from 'react';
import { useSavedPostStore } from '@/store/savedpoststore';
import PostCard from '../components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const SavedPostsPage = () => {
    const { savedPosts, fetchSavedPosts, isLoading, error } = useSavedPostStore();

    useEffect(() => {
        fetchSavedPosts();
    }, [fetchSavedPosts]);

    return (
        <div className="container max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Saved Posts</h2>
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-16">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={() => fetchSavedPosts()}>Retry</Button>
                </div>
            ) : savedPosts.length === 0 ? (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold">No saved posts</h3>
                    <p className="text-muted-foreground">You haven't saved any posts yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {savedPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedPostsPage; 