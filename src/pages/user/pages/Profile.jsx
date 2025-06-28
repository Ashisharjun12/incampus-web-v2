import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authstore';
import { authAPI } from '@/api/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit2 } from 'lucide-react';
import ProfileEditModal from './ProfileEditModal';

const ProfilePage = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data.data);
      } catch (error) {
        toast.error('Failed to fetch profile.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
    setShowEditModal(false);
    
    // Update auth store
    setAuthUser(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-black p-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">Could not load profile.</p>
        </div>
      </div>
    );
  }
  
  const userInitial = authUser?.anonymousUsername?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || '?';
  const currentAvatarUrl = profile.avatarUrl || profile.googleAvatarUrl;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentAvatarUrl} alt={profile.anonymousUsername || profile.name} />
                  <AvatarFallback className="text-3xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">
                    {profile.anonymousUsername || profile.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {profile.email}
                  </CardDescription>
                  <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    {profile.role}
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => setShowEditModal(true)}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full px-4 py-2 font-medium"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Username</span>
                  <span className="text-sm text-gray-900 dark:text-white">{profile.anonymousUsername || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Age</span>
                  <span className="text-sm text-gray-900 dark:text-white">{profile.age || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</span>
                  <span className="text-sm text-gray-900 dark:text-white capitalize">{profile.gender || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Joined</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Modal */}
        <ProfileEditModal 
          open={showEditModal}
          onOpenChange={setShowEditModal}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    </div>
  );
};

export default ProfilePage; 