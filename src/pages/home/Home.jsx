import React, { useEffect, useState } from 'react';
import LandingPage from './LandingPage';
import Footer from './Footer';
import { useAuthStore } from '@/store/authstore';
import { postAPI } from '@/api/api';
import PostCard from '@/pages/posts/components/PostCard';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/pages/posts/components/CreatePostModal';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { authUser } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser && authUser.isProfileComplete) {
      loadPosts();
    }
  }, [authUser]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postAPI.getAll();
      if (response.data.success) {
        console.log('Fetched posts data:', response.data.data);
        setPosts(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    console.log('🔄 Home: handlePostCreated called with:', newPost);
    
    // Safety check to ensure newPost has the required structure
    if (!newPost || !newPost.id) {
      console.error('🔄 Home: Invalid post data received:', newPost);
      toast.error('Failed to create post - invalid data received');
      return;
    }
    
    // Add the new post to the beginning of the list
    setPosts(prev => {
      console.log('🔄 Home: Previous posts:', prev);
      const updatedPosts = [newPost, ...prev];
      console.log('🔄 Home: Updated posts:', updatedPosts);
      return updatedPosts;
    });
    setShowCreatePost(false);
  };

  if (!authUser || !authUser.isProfileComplete) {
    return (
      <>
        <LandingPage />
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first layout */}
      <div className="w-full max-w-xl mx-auto py-4 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold">No posts yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to create a post!</p>
            <Button 
              onClick={() => setShowCreatePost(true)}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Create Post
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {posts.map((post, idx) => (
              <React.Fragment key={`post-${post.id}-${idx}`}>
                <div onClick={() => navigate(`/post/${post.id}`)} className="cursor-pointer">
                  <PostCard 
                    post={post} 
                    onDelete={loadPosts} 
                    onEdit={loadPosts} 
                  />
                </div>
                {idx !== posts.length - 1 && (
                  <div className="my-4 border-t-2 border-border/90" />
                )}
              </React.Fragment>
            ))}
          </div>
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