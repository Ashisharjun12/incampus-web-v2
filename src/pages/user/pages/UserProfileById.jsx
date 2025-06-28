import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI, postAPI } from '@/api/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authstore';
import { toast } from 'sonner';
import { 
  User, 
  MapPin, 
  Calendar, 
  Building2, 
  Edit, 
  Grid3X3,
  Heart
} from 'lucide-react';
import PostCard from '../../posts/components/PostCard';

const UserProfileById = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

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
        const res = await postAPI.getAll({ userId: id, limit: 20 });
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
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User not found</h2>
          <p className="text-gray-500 dark:text-gray-400">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = authUser && (authUser.userId === profile.userId || authUser.id === profile.userId);
  const userInitial = profile?.anonymousUsername?.charAt(0).toUpperCase() || profile?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="px-4 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-900 shadow-lg">
              <AvatarImage src={profile.avatarUrl || profile.googleAvatarUrl} alt={profile.anonymousUsername || profile.name} />
              <AvatarFallback className="text-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile.anonymousUsername || profile.name}
                </h1>
                {profile.gender && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {profile.gender}
                  </Badge>
                )}
              </div>
              
              {profile.college && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-3">
                  {profile.college.logoUrl ? (
                    <img 
                      src={profile.college.logoUrl} 
                      alt={profile.college.name} 
                      className="h-5 w-5 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  <span className="font-medium">{profile.college.name}</span>
                </div>
              )}
              
              {profile.location && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    className="rounded-full px-6"
                    onClick={() => navigate('/profile')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">{posts.length}</span>
              <span className="text-gray-500 dark:text-gray-400">posts</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
            <TabsTrigger value="posts" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-4">
            {postsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <Grid3X3 className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isOwnProfile ? 'Start sharing your thoughts!' : 'This user hasn\'t posted anything yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Profile Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Username:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{profile.anonymousUsername || profile.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Age:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{profile.age || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Gender:</span>
                    <span className="text-sm text-gray-900 dark:text-white capitalize">{profile.gender || 'Not specified'}</span>
                  </div>
                  {profile.college && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">College:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{profile.college.name}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Location:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfileById; 