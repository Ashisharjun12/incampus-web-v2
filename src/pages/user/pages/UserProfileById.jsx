import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authAPI, postAPI } from '@/api/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authstore';
import { toast } from 'sonner';

const UserProfileById = () => {
  const { id } = useParams();
  const { authUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfileById(id);
        setProfile(response.data.data);
      } catch (error) {
        toast.error('Failed to fetch profile.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await postAPI.getAll({ userId: id, limit: 50 });
        setPosts(res.data.data || []);
      } catch (e) {
        toast.error('Failed to load posts');
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, [id]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-64">User not found.</div>;
  }

  const isOwnProfile = authUser && (authUser.userId === profile.userId || authUser.id === profile.userId);
  const userInitial = profile?.anonymousUsername?.charAt(0).toUpperCase() || profile?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Top Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-28 w-28 mb-4 shadow-lg border-4 border-white dark:border-gray-900">
          <AvatarImage src={profile.avatarUrl || profile.googleAvatarUrl} alt={profile.anonymousUsername || profile.name} />
          <AvatarFallback className="text-4xl">{userInitial}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {profile.anonymousUsername || profile.name}
          </div>
          {profile.college && (
            <div className="text-gray-500 dark:text-gray-400 text-base mb-1">{profile.college.name}</div>
          )}
          {profile.gender && (
            <div className="text-gray-400 dark:text-gray-500 text-sm mb-2 capitalize">{profile.gender}</div>
          )}
          {isOwnProfile && (
            <Button variant="outline" className="mt-2">Edit Profile</Button>
          )}
        </div>
      </div>

      {/* Posts Grid Section */}
      <div>
        <div className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">Posts</div>
        {postsLoading ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {posts.map(post => {
              const img = post.images && post.images.length > 0 ? post.images[0] : null;
              return img ? (
                <div key={post.id} className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer group">
                  <img
                    src={img}
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileById; 