import React, { useEffect } from 'react';
import { useSavedPostStore } from '@/store/savedpoststore';
import PostCard from '../components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Bookmark, RefreshCw } from 'lucide-react';

const SavedPostsPage = () => {
    const { savedPosts, fetchSavedPosts, isLoading, error } = useSavedPostStore();
   

    useEffect(() => {
        fetchSavedPosts();
    }, [fetchSavedPosts]);

    return (
        <div className="min-h-screen w-full bg-white dark:bg-black">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Bookmark className="h-5 w-5 text-gray-500" />
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Posts</h1>
                            </div>
                            {savedPosts.length > 0 && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {savedPosts.length} {savedPosts.length === 1 ? 'post' : 'posts'}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fetchSavedPosts()}
                            disabled={isLoading}
                            className="h-8 w-8"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 py-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <div className="space-y-4">
                                <Bookmark className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                                <div>
                                    <p className="text-red-500 mb-4">{error}</p>
                                    <Button 
                                        onClick={() => fetchSavedPosts()}
                                        className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : savedPosts.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="space-y-4">
                                <Bookmark className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved posts yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Posts you save will appear here for easy access.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {savedPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedPostsPage; 