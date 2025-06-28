import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authAPI } from '@/api/api';
import { RefreshCw, Check, X, Camera, Sparkles } from 'lucide-react';

const avatarStyles = [
  'adventurer', 'avataaars', 'bottts', 'micah', 'initials', 'lorelei', 'notionists', 'personas'
];

const generateAvatarUrl = (style, seed) => {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
};

const ProfileEditModal = ({ open, onOpenChange, profile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    anonymousUsername: '',
    avatarUrl: '',
  });
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setFormData({
        anonymousUsername: profile.anonymousUsername || '',
        avatarUrl: profile.avatarUrl || '',
      });
      generateAvatars();
    }
  }, [open, profile]);

  const generateAvatars = () => {
    setIsGeneratingAvatar(true);
    const generatedAvatars = Array.from({ length: 12 }, (_, i) => {
      const style = avatarStyles[i % avatarStyles.length];
      const seed = Math.random().toString(36).substring(7);
      return generateAvatarUrl(style, seed);
    });
    setAvatars(generatedAvatars);
    setTimeout(() => setIsGeneratingAvatar(false), 500);
  };

  const generateRandomUsername = async () => {
    setIsGeneratingUsername(true);
    try {
      const response = await authAPI.generateUniqueUsername();
      if (response.data.success) {
        const newUsername = response.data.data.username;
        setFormData(prev => ({ ...prev, anonymousUsername: newUsername }));
        toast.success('New username generated!');
      } else {
        toast.error('Failed to generate username.');
      }
    } catch (error) {
      toast.error('Failed to generate username.');
      console.error(error);
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const handleAvatarSelect = (url) => {
    setFormData(prev => ({ ...prev, avatarUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authAPI.updateProfile(formData);
      const updatedProfile = response.data.data;
      
      onProfileUpdated(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const userInitial = profile?.anonymousUsername?.charAt(0).toUpperCase() || profile?.name?.charAt(0).toUpperCase() || '?';
  const currentAvatarUrl = formData.avatarUrl || profile?.avatarUrl || profile?.googleAvatarUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full p-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg">
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2"
            >
             
            </Button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentAvatarUrl} alt="Profile avatar" />
                    <AvatarFallback className="text-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateAvatars}
                      disabled={isGeneratingAvatar}
                      className="w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                    >
                      {isGeneratingAvatar ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 mr-2" />
                      )}
                      Generate New Avatars
                    </Button>
                  </div>
                </div>
                {/* Avatar Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {avatars.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Avatar ${index}`}
                      className={`cursor-pointer rounded-full p-1 border-2 aspect-square transition-all hover:scale-110 hover:shadow-lg ${
                        formData.avatarUrl === url 
                          ? 'border-black dark:border-white ring-2 ring-gray-300 dark:ring-gray-700' 
                          : 'border-transparent hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                      style={{ width: 64, height: 64 }}
                      onClick={() => handleAvatarSelect(url)}
                    />
                  ))}
                </div>
              </div>

              {/* Username Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
                <div className="flex items-center gap-3">
                  <Input
                    value={formData.anonymousUsername}
                    readOnly
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg"
                    placeholder="Click Generate to create username"
                  />
                  <Button
                    type="button"
                    onClick={generateRandomUsername}
                    disabled={isGeneratingUsername}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
                  >
                    {isGeneratingUsername ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Username is automatically generated and checked for uniqueness
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full font-medium"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal; 