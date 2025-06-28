import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Crown, 
  UserCheck, 
  UserX, 
  MapPin, 
  Building2,
  Edit,
  Trash2,
  Loader2,
  Shield,
  User,
  Clock,
  FileText,
  MessageSquare,
  Users,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Image as ImageIcon,
  Video as VideoIcon,
  AlertTriangle,
  Ban,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/api/api';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    posts: 0,
    comments: 0,
    followers: 0,
    following: 0,
    communities: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  
  // Suspension modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [suspensionData, setSuspensionData] = useState({
    reason: '',
    duration: '7',
    customDuration: '',
    durationType: 'days'
  });
  const [deletionData, setDeletionData] = useState({
    reason: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'posts' && posts.length === 0) {
      fetchUserPosts();
    } else if (activeTab === 'comments' && comments.length === 0) {
      fetchUserComments();
    } else if (activeTab === 'communities' && communities.length === 0) {
      fetchUserCommunities();
    }
  }, [activeTab]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserById(userId);
      if (response.data.success) {
        setUser(response.data.data);
        setUserStats(response.data.data.stats || {
          posts: 0,
          comments: 0,
          followers: 0,
          following: 0,
          communities: 0
        });
      } else {
        toast.error('Failed to fetch user details');
        navigate('/admin/users');
      }
    } catch (error) {
      toast.error('Failed to fetch user details');
      console.error('Error fetching user details:', error);
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await adminAPI.getUserPosts(userId, { limit: 20 });
      if (response.data.success) {
        setPosts(response.data.data);
      } else {
        toast.error('Failed to fetch user posts');
      }
    } catch (error) {
      toast.error('Failed to fetch user posts');
      console.error('Error fetching user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchUserComments = async () => {
    try {
      setLoadingComments(true);
      const response = await adminAPI.getUserComments(userId, { limit: 20 });
      if (response.data.success) {
        setComments(response.data.data);
      } else {
        toast.error('Failed to fetch user comments');
      }
    } catch (error) {
      toast.error('Failed to fetch user comments');
      console.error('Error fetching user comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchUserCommunities = async () => {
    try {
      setLoadingCommunities(true);
      const response = await adminAPI.getUserCommunities(userId, { limit: 20 });
      if (response.data.success) {
        setCommunities(response.data.data);
      } else {
        toast.error('Failed to fetch user communities');
      }
    } catch (error) {
      toast.error('Failed to fetch user communities');
      console.error('Error fetching user communities:', error);
    } finally {
      setLoadingCommunities(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleEditUser = () => {
    toast.info('Edit user functionality coming soon');
  };

  const handleDeleteUser = () => {
    setShowDeleteModal(true);
  };

  const handleSuspendUser = () => {
    setShowSuspendModal(true);
  };

  const handleSuspendUserSubmit = async () => {
    try {
      setActionLoading(true);
      
      let duration = suspensionData.duration;
      if (suspensionData.duration === 'custom') {
        duration = `${suspensionData.customDuration} ${suspensionData.durationType}`;
      } else if (suspensionData.duration === 'indefinite') {
        duration = 'Indefinite';
      } else {
        duration = `${suspensionData.duration} ${suspensionData.durationType}`;
      }
      
      const response = await adminAPI.suspendUser(userId, { 
        reason: suspensionData.reason, 
        duration 
      });
      
      if (response.data.success) {
        toast.success('User suspended successfully');
        setShowSuspendModal(false);
        setSuspensionData({ reason: '', duration: '7', customDuration: '', durationType: 'days' });
        fetchUserDetails(); // Refresh user data
      } else {
        toast.error(response.data.message || 'Failed to suspend user');
      }
    } catch (error) {
      toast.error('Failed to suspend user');
      console.error('Error suspending user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspendUser = async () => {
    try {
      const confirmed = confirm('Are you sure you want to unsuspend this user?');
      if (!confirmed) return;
      
      const response = await adminAPI.unsuspendUser(userId);
      if (response.data.success) {
        toast.success('User unsuspended successfully');
        fetchUserDetails(); // Refresh user data
      } else {
        toast.error(response.data.message || 'Failed to unsuspend user');
      }
    } catch (error) {
      toast.error('Failed to unsuspend user');
      console.error('Error unsuspending user:', error);
    }
  };

  const handleDeleteUserAccount = async () => {
    try {
      setActionLoading(true);
      
      const response = await adminAPI.deleteUser(userId, { reason: deletionData.reason });
      if (response.data.success) {
        toast.success('User account deleted successfully');
        setShowDeleteModal(false);
        setDeletionData({ reason: '' });
        fetchUserDetails(); // Refresh user data
      } else {
        toast.error(response.data.message || 'Failed to delete user account');
      }
    } catch (error) {
      toast.error('Failed to delete user account');
      console.error('Error deleting user account:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreUser = async () => {
    try {
      const confirmed = confirm('Are you sure you want to restore this user account?');
      
      if (!confirmed) return;
      
      const response = await adminAPI.restoreUser(userId);
      if (response.data.success) {
        toast.success('User account restored successfully');
        fetchUserDetails(); // Refresh user data
      } else {
        toast.error(response.data.message || 'Failed to restore user account');
      }
    } catch (error) {
      toast.error('Failed to restore user account');
      console.error('Error restoring user account:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">User not found</h3>
        <Button onClick={() => navigate('/admin/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
            <p className="text-muted-foreground">
              Comprehensive information about {user.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditUser}>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
          <Button variant="destructive" onClick={handleDeleteUser}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts ({userStats.posts})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({userStats.comments})</TabsTrigger>
          <TabsTrigger value="communities">Communities ({userStats.communities})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main User Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {/* Profile Avatar */}
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user.profile?.avatarUrl || user.googleAvatarUrl} alt={user.name} />
                        <AvatarFallback className="text-lg">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {/* Google Avatar (if different from profile avatar) */}
                      {user.profile?.avatarUrl && user.googleAvatarUrl && user.profile.avatarUrl !== user.googleAvatarUrl && (
                        <div className="flex flex-col items-center gap-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.googleAvatarUrl} alt={`${user.name} (Google)`} />
                            <AvatarFallback className="text-xs">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">Google</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? (
                            <Crown className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                        <Badge variant={user.isProfileComplete ? 'default' : 'destructive'}>
                          {user.isProfileComplete ? (
                            <UserCheck className="h-3 w-3 mr-1" />
                          ) : (
                            <UserX className="h-3 w-3 mr-1" />
                          )}
                          {user.isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                        </Badge>
                      </div>
                      {user.profile?.anonymousUsername && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Anonymous: @{user.profile.anonymousUsername}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(user.updatedAt || user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">User ID</p>
                        <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                      </div>
                    </div>
                    {user.profile?.gender && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Gender</p>
                          <p className="text-sm text-muted-foreground capitalize">{user.profile.gender}</p>
                        </div>
                      </div>
                    )}
                    {user.profile?.age && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Age</p>
                          <p className="text-sm text-muted-foreground">{user.profile.age} years</p>
                        </div>
                      </div>
                    )}
                    {user.profile?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{user.profile.location}</p>
                        </div>
                      </div>
                    )}
                    {user.college && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">College</p>
                          <div className="flex items-center gap-2">
                            {user.college.logoUrl && (
                              <img 
                                src={user.college.logoUrl} 
                                alt={user.college.name}
                                className="h-4 w-4 rounded-full object-cover"
                              />
                            )}
                            <p className="text-sm text-muted-foreground">{user.college.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {user.profile?.bio && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Bio</p>
                        <p className="text-sm text-muted-foreground">{user.profile.bio}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Activity Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{userStats.posts}</div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                      <div className="text-xs text-muted-foreground mt-1">Created</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userStats.comments}</div>
                      <div className="text-sm text-muted-foreground">Comments</div>
                      <div className="text-xs text-muted-foreground mt-1">Written</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{userStats.followers}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                      <div className="text-xs text-muted-foreground mt-1">People following</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{userStats.following}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                      <div className="text-xs text-muted-foreground mt-1">People followed</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{userStats.communities}</div>
                      <div className="text-sm text-muted-foreground">Communities</div>
                      <div className="text-xs text-muted-foreground mt-1">Joined</div>
                    </div>
                  </div>
                  
                  {/* Additional Stats */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Member Since</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Last Active</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {user.profile?.isLastActive ? formatDate(user.profile.isLastActive) : 'Recently'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Account Status</span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {user.profile?.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Role
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Verify Profile
                  </Button>
                  
                  {/* Account Management Actions */}
                  <Separator className="my-3" />
                  
                  {user.profile?.status === 'active' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-orange-600 hover:text-orange-600/90 hover:bg-orange-50"
                        onClick={handleSuspendUser}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Suspend User
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:text-red-600/90 hover:bg-red-50"
                        onClick={handleDeleteUserAccount}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </>
                  )}
                  
                  {user.profile?.status === 'suspended' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-green-600 hover:text-green-600/90 hover:bg-green-50"
                        onClick={handleUnsuspendUser}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Unsuspend User
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:text-red-600/90 hover:bg-red-50"
                        onClick={handleDeleteUserAccount}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </>
                  )}
                  
                  {user.profile?.status === 'deleted' && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-green-600 hover:text-green-600/90 hover:bg-green-50"
                      onClick={handleRestoreUser}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Restore Account
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Status</span>
                    <Badge 
                      variant={
                        user.profile?.status === 'active' ? 'default' : 
                        user.profile?.status === 'suspended' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {user.profile?.status === 'active' && 'Active'}
                      {user.profile?.status === 'suspended' && 'Suspended'}
                      {user.profile?.status === 'deleted' && 'Deleted'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Verified</span>
                    <Badge variant="default">Yes</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile Complete</span>
                    <Badge variant={user.isProfileComplete ? 'default' : 'destructive'}>
                      {user.isProfileComplete ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Role</span>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NSFW Enabled</span>
                    <Badge variant={user.profile?.nsfwEnabled ? 'destructive' : 'secondary'}>
                      {user.profile?.nsfwEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allow DMs</span>
                    <Badge variant={user.profile?.allowDm ? 'default' : 'secondary'}>
                      {user.profile?.allowDm ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Login:</span>
                    <span>Recently</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Login Count:</span>
                    <span>42</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                User Posts ({userStats.posts})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={post.isNsfw ? 'destructive' : 'secondary'}>
                              {post.isNsfw ? 'NSFW' : 'Safe'}
                            </Badge>
                            {post.isAnonymous && (
                              <Badge variant="outline">Anonymous</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{truncateText(post.caption, 200)}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likeCount || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post.commentCount || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share className="h-4 w-4" />
                              {post.shareCount || 0}
                            </div>
                            {post.images?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <ImageIcon className="h-4 w-4" />
                                {post.images.length}
                              </div>
                            )}
                            {post.videos?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <VideoIcon className="h-4 w-4" />
                                {post.videos.length}
                              </div>
                            )}
                          </div>
                          {post.communityName && (
                            <div className="flex items-center gap-2 mt-2">
                              {post.communityLogoUrl && (
                                <img 
                                  src={post.communityLogoUrl} 
                                  alt={post.communityName}
                                  className="h-4 w-4 rounded-full object-cover"
                                />
                              )}
                              <span className="text-xs text-muted-foreground">
                                Posted in c/{post.communityName}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No posts found</h3>
                  <p className="text-muted-foreground">
                    This user hasn't created any posts yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Comments ({userStats.comments})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingComments ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {comment.isEdited && (
                              <Badge variant="outline">Edited</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{truncateText(comment.content, 200)}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {comment.likeCount || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {comment.replyCount || 0}
                            </div>
                          </div>
                          {comment.postCaption && (
                            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">On post:</p>
                              <p className="text-sm">{truncateText(comment.postCaption, 100)}</p>
                              {comment.communityName && (
                                <div className="flex items-center gap-2 mt-2">
                                  {comment.communityLogoUrl && (
                                    <img 
                                      src={comment.communityLogoUrl} 
                                      alt={comment.communityName}
                                      className="h-3 w-3 rounded-full object-cover"
                                    />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    c/{comment.communityName}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No comments found</h3>
                  <p className="text-muted-foreground">
                    This user hasn't written any comments yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Communities ({userStats.communities})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCommunities ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : communities.length > 0 ? (
                <div className="space-y-4">
                  {communities.map((community) => (
                    <Card key={community.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={community.logoUrl} alt={community.name} />
                            <AvatarFallback>
                              {community.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">c/{community.name}</h3>
                              {community.isNsfw && (
                                <Badge variant="destructive">NSFW</Badge>
                              )}
                              {community.createdById === userId && (
                                <Badge variant="default">Creator</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {truncateText(community.description, 100)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{community.memberCount || 0} members</span>
                              <span>{community.postCount || 0} posts</span>
                              <span>Joined {formatDate(community.joinedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No communities found</h3>
                  <p className="text-muted-foreground">
                    This user hasn't joined any communities yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspension Modal */}
      <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              Suspend User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Suspension Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Suspending this user will prevent them from creating posts, comments, and joining communities. They will see a suspension notice when they try to access the platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="suspension-reason">Reason for Suspension</Label>
                <Textarea
                  id="suspension-reason"
                  placeholder="Enter the reason for suspending this user..."
                  value={suspensionData.reason}
                  onChange={(e) => setSuspensionData(prev => ({ ...prev, reason: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="suspension-duration">Duration</Label>
                <Select 
                  value={suspensionData.duration} 
                  onValueChange={(value) => setSuspensionData(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="custom">Custom duration</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {suspensionData.duration === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="custom-duration">Duration</Label>
                    <Input
                      id="custom-duration"
                      type="number"
                      min="1"
                      placeholder="Enter number"
                      value={suspensionData.customDuration}
                      onChange={(e) => setSuspensionData(prev => ({ ...prev, customDuration: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration-type">Type</Label>
                    <Select 
                      value={suspensionData.durationType} 
                      onValueChange={(value) => setSuspensionData(prev => ({ ...prev, durationType: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSuspendUserSubmit}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suspending...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deletion Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete User Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
                    Permanent Deletion Warning
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This action will permanently delete the user's account. All their posts, comments, and data will be removed. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="deletion-reason">Reason for Deletion</Label>
              <Textarea
                id="deletion-reason"
                placeholder="Enter the reason for deleting this user account..."
                value={deletionData.reason}
                onChange={(e) => setDeletionData(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUserAccount}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetails; 