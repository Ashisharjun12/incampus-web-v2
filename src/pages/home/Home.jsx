import React, { useEffect, useState, useRef } from 'react';
import LandingPage from './LandingPage';
import Footer from './Footer';
import { useAuthStore } from '@/store/authstore';
import { postAPI } from '@/api/api';
import PostCard from '@/pages/posts/components/PostCard';
import { toast } from 'sonner';
import { Loader2, Plus, TrendingUp, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/pages/posts/components/CreatePostModal';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { authUser } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('foryou'); // 'foryou', 'college', 'saved'
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const navigate = useNavigate();
  
  // Ref for intersection observer
  const observerRef = useRef();
  const lastPostRef = useRef();

  useEffect(() => {
    if (authUser && authUser.isProfileComplete) {
      loadPosts();
    }
  }, [authUser]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const loadPosts = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      // Prepare query parameters
      const params = { 
        page, 
        limit: 10 
      };
      
      // Add collegeId filter for college tab
      if (activeTab === 'college' && authUser?.profile?.collegeId) {
        params.collegeId = authUser.profile.collegeId;
      }
      
      const response = await postAPI.getAll(params);
      
      if (response.data.success) {
        const newPosts = response.data.data;
        const pagination = response.data.pagination;
        
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        setCurrentPage(page);
        setTotalPosts(pagination.total);
        setHasMore(page < pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    await loadPosts(nextPage, true);
  };

  // Simple intersection observer setup
  const setupIntersectionObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMorePosts();
      }
    }, {
      rootMargin: '100px'
    });

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current);
    }
  };

  // Setup observer when posts change
  useEffect(() => {
    if (posts.length > 0 && hasMore) {
      setupIntersectionObserver();
    }
  }, [posts, hasMore, isLoadingMore]);

  const loadTrendingPosts = async () => {
    try {
      setIsLoadingTrending(true);
      const response = await postAPI.getAll({ limit: 5 });
      if (response.data.success) {
        setTrendingPosts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load trending posts:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const handlePostCreated = (newPost) => {
    if (!newPost || !newPost.id) {
      toast.error('Failed to create post - invalid data received');
      return;
    }
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Reset pagination and reload posts when switching tabs
    if (tab === 'foryou' || tab === 'college') {
      setCurrentPage(1);
      setHasMore(true);
      setPosts([]);
      setTimeout(() => {
        loadPosts(1, false);
      }, 0);
    }
    
    if (tab === 'college' && trendingPosts.length === 0) {
      loadTrendingPosts();
    } else if (tab === 'saved') {
      navigate('/saved');
    }
  };

  if (!authUser || !authUser.isProfileComplete) {
    return (
      <>
        <LandingPage />
        <Footer />
      </>
    );
  }

  // --- Tab UI and Filtering Logic ---
  const userCollegeId = authUser?.profile?.collegeId;
  const filteredPosts = posts;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-xl mx-auto py-4 px-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-full font-bold text-base transition-colors duration-150 focus:outline-none 
              ${activeTab === 'foryou' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            onClick={() => handleTabChange('foryou')}
          >
            For you
          </button>
          <button
            className={`px-4 py-2 rounded-full font-bold text-base transition-colors duration-150 focus:outline-none 
              ${activeTab === 'college' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            onClick={() => handleTabChange('college')}
            disabled={!userCollegeId}
            title={!userCollegeId ? 'No college set in your profile' : ''}
          >
            College
          </button>
          <button
            className={`px-4 py-2 rounded-full font-bold text-base transition-colors duration-150 focus:outline-none 
              ${activeTab === 'saved' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            onClick={() => handleTabChange('saved')}
          >
            <Bookmark className="h-4 w-4 inline mr-1" />
            Saved
          </button>
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* College Tab with Trending Section */}
            {activeTab === 'college' && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trending</h2>
                </div>
                {isLoadingTrending ? (
                  <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : trendingPosts.length > 0 ? (
                  <div className="flex flex-col gap-0 mb-6">
                    {trendingPosts.map((post, idx) => (
                      <React.Fragment key={`trending-${post.id}-${idx}`}>
                        <div onClick={() => navigate(`/post/${post.id}`)} className="cursor-pointer">
                          <PostCard 
                            post={post} 
                            onDelete={loadPosts} 
                            onEdit={loadPosts} 
                          />
                        </div>
                        {idx !== trendingPosts.length - 1 && (
                          <div className="my-4 border-t-2 border-border/90" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No trending posts yet
                  </div>
                )}
                
                {/* College Posts Section */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">College Posts</h2>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'college' ? 'No posts from your college communities yet' : 'Be the first to create a post!'}
                </p>
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Create Post
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {filteredPosts.map((post, idx) => (
                  <React.Fragment key={`post-${post.id}-${idx}`}>
                    <div 
                      ref={idx === filteredPosts.length - 1 ? lastPostRef : null}
                      onClick={() => navigate(`/post/${post.id}`)} 
                      className="cursor-pointer"
                    >
                      <PostCard 
                        post={post} 
                        onDelete={loadPosts} 
                        onEdit={loadPosts} 
                      />
                    </div>
                    {idx !== filteredPosts.length - 1 && (
                      <div className="my-4 border-t-2 border-border/90" />
                    )}
                  </React.Fragment>
                ))}
                
                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading more posts...</span>
                  </div>
                )}
                
                {/* End of feed indicator */}
                {!hasMore && filteredPosts.length > 0 && (
                  <div className="text-center py-8">
                    <div className="text-sm text-muted-foreground">
                      You've reached the end of the feed
                    </div>
                    <Button 
                      onClick={() => setShowCreatePost(true)}
                      className="mt-4 bg-foreground text-background hover:bg-foreground/90"
                    >
                      Create a post
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      {authUser && (
        <Button 
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-50 sm:hidden"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Create Post Modal */}
      <CreatePostModal 
        open={showCreatePost} 
        onOpenChange={setShowCreatePost} 
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Home;