import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authstore';
import { authAPI } from '@/api/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    anonymousUsername: '',
    gender: '',
    age: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data.data);
        setFormData({
            anonymousUsername: response.data.data.anonymousUsername || '',
            gender: response.data.data.gender || 'other',
            age: response.data.data.age || '',
        })
      } catch (error) {
        toast.error('Failed to fetch profile.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await authAPI.updateProfile(formData);
        const updatedProfile = response.data.data;
        
        // Update the zustand store if isProfileComplete was changed
        const wasProfileIncomplete = !authUser.isProfileComplete;
        
        setProfile(updatedProfile);
        toast.success("Profile updated successfully!");
        setIsEditing(false);

        // refetch user to get updated isProfileComplete status
        const userResponse = await authAPI.getProfile();
        setAuthUser(userResponse.data.data);

    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update profile.');
        console.error(error);
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Could not load profile.</div>;
  }
  
  const userInitial = authUser?.anonymousUsername?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.avatarUrl || profile.googleAvatarUrl} alt={profile.anonymousUsername || profile.name} />
                        <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{profile.anonymousUsername || profile.name}</CardTitle>
                        <CardDescription>{profile.email}</CardDescription>
                        <span className="text-xs bg-secondary text-secondary-foreground p-1 rounded-md">{profile.role}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="anonymousUsername">Anonymous Username</Label>
                            <Input id="anonymousUsername" name="anonymousUsername" value={formData.anonymousUsername} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} />
                        </div>
                         <div>
                            <Label htmlFor="gender">Gender</Label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-transparent">
                                <option value="other">Other</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <Button type="submit">Save Changes</Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                         <h3 className="text-lg font-semibold">Profile Details</h3>
                         <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                       </div>
                        <p><strong>Anonymous Username:</strong> {profile.anonymousUsername || 'Not set'}</p>
                        <p><strong>Age:</strong> {profile.age || 'Not set'}</p>
                        <p><strong>Gender:</strong> {profile.gender || 'Not set'}</p>
                        <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default ProfilePage; 