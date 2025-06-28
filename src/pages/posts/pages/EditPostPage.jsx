import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI, communityAPI, uploadAPI, authAPI } from '@/api/api';
import { useAuthStore } from '@/store/authstore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
    Loader2, 
    Type, 
    Image, 
    Video, 
    X, 
    AlertTriangle, 
    Globe, 
    Search,
    Building2,
    Users,
    Crown,
    ChevronDown
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [caption, setCaption] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [activeTab, setActiveTab] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Community state
  const [communities, setCommunities] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [userCreatedCommunities, setUserCreatedCommunities] = useState([]);
  const [collegeCommunities, setCollegeCommunities] = useState([]);
  const [communityFilter, setCommunityFilter] = useState('all');
  const [communitySearch, setCommunitySearch] = useState('');
  const [showCommunitySelector, setShowCommunitySelector] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await postAPI.getById(id);
        if (!res.data.success) throw new Error('Post not found');
        const postData = res.data.data;
        
        // Only allow owner
        if (!authUser || !postData.author || postData.author.id !== authUser.userId) {
          toast.error('You do not have permission to edit this post.');
          navigate('/');
          return;
        }
        
        setPost(postData);
        setCaption(postData.caption || '');
        setSelectedCommunity(postData.community?.id || '');
        setIsNsfw(postData.isNsfw || false);
        
        // Preload media
        const images = (postData.images || []).map(url => ({ url, type: 'image' }));
        const videos = (postData.videos || []).map(url => ({ url, type: 'video' }));
        setMediaPreviews([...images, ...videos]);
        setMediaFiles([]); // Only new uploads go here
        
        // Load communities
        await loadUserProfileAndCommunities();
        
      } catch (e) {
        toast.error('Failed to load post.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, authUser, navigate]);

  const loadUserProfileAndCommunities = async () => {
    try {
      // Load user profile first to get college info
      const profileResponse = await authAPI.getProfile();
      if (profileResponse.data.success) {
        setUserProfile(profileResponse.data.data);
      }

      // Load all communities
      const allResponse = await communityAPI.getAll();
      if (allResponse.data.success) {
        setAllCommunities(allResponse.data.data);
      }

      // Load user's joined communities
      const userResponse = await communityAPI.getUserCommunities();
      if (userResponse.data.success) {
        setCommunities(userResponse.data.data);
      }

      // Filter user created communities
      const created = allResponse.data.data.filter(c => c.createdById === authUser?.id);
      setUserCreatedCommunities(created);

      // Filter college communities using profile data
      if (profileResponse.data.success && profileResponse.data.data.collegeId) {
        const college = allResponse.data.data.filter(c => c.collegeId === profileResponse.data.data.collegeId);
        setCollegeCommunities(college);
      }
    } catch (error) {
      toast.error('Failed to load communities.');
    }
  };

  const getFilteredCommunities = () => {
    let filtered = [];
    
    switch (communityFilter) {
      case 'college':
        filtered = collegeCommunities;
        break;
      case 'created':
        filtered = userCreatedCommunities;
        break;
      case 'all':
      default:
        filtered = allCommunities;
        break;
    }

    if (communitySearch) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(communitySearch.toLowerCase()) ||
        c.description?.toLowerCase().includes(communitySearch.toLowerCase())
      );
    }

    return filtered;
  };

  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (type === 'image' && (mediaFiles.length + files.length) > 10) {
      return toast.error("You can't upload more than 10 images.");
    }
    if (type === 'video' && files.length > 1) {
      return toast.error("You can only upload one video.");
    }

    const newFiles = files.map(file => ({ file, type }));
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video'
    }));

    if (type === 'image') {
      setMediaFiles(prev => [...prev, ...newFiles]);
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    } else {
      setMediaFiles(newFiles);
      setMediaPreviews(newPreviews);
    }
  };

  const removeMedia = (index) => {
    const preview = mediaPreviews[index];
    if (preview.url.startsWith('blob:')) URL.revokeObjectURL(preview.url);
    setMediaFiles(files => files.filter((_, i) => i !== index));
    setMediaPreviews(previews => previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedCommunity) return toast.error('Please select a community.');
    if (!caption && mediaPreviews.length === 0) return toast.error('Your post has no content.');

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Get existing media URLs (from original post that weren't removed)
      const existingImages = post.images || [];
      const existingVideos = post.videos || [];
      
      console.log('🔍 Debug - Original post images:', existingImages);
      console.log('🔍 Debug - Original post videos:', existingVideos);
      console.log('🔍 Debug - Current mediaPreviews:', mediaPreviews);
      
      // Filter out existing media that were removed by user
      const remainingImages = existingImages.filter(imgUrl => 
        mediaPreviews.some(preview => preview.url === imgUrl && preview.type === 'image')
      );
      const remainingVideos = existingVideos.filter(videoUrl => 
        mediaPreviews.some(preview => preview.url === videoUrl && preview.type === 'video')
      );

      console.log('🔍 Debug - Remaining images after filter:', remainingImages);
      console.log('🔍 Debug - Remaining videos after filter:', remainingVideos);

      let finalImageUrls = [...remainingImages];
      let finalVideoUrls = [...remainingVideos];

      // Upload new files if any
      if (mediaFiles.length > 0) {
        console.log('🔍 Debug - New mediaFiles to upload:', mediaFiles);
        const imageBlobs = mediaFiles.filter(f => f.type === 'image').map(f => f.file);
        const videoBlobs = mediaFiles.filter(f => f.type === 'video').map(f => f.file);
        
        if (imageBlobs.length > 0) {
          console.log('🔍 Debug - Uploading new images:', imageBlobs.length);
          const res = await uploadAPI.uploadImages(imageBlobs, 'posts');
          finalImageUrls = [...finalImageUrls, ...res.data.data.map(item => item.url)];
          console.log('🔍 Debug - New image URLs:', res.data.data.map(item => item.url));
        }
        if (videoBlobs.length > 0) {
          console.log('🔍 Debug - Uploading new video:', videoBlobs.length);
          const res = await uploadAPI.uploadVideo(videoBlobs[0], 'posts');
          finalVideoUrls = [...finalVideoUrls, res.data.data.url];
          console.log('🔍 Debug - New video URL:', res.data.data.url);
        }
      }
      setIsUploading(false);

      const payload = {
        caption,
        isNsfw,
        images: finalImageUrls,
        videos: finalVideoUrls,
        communityId: selectedCommunity,
      };

      console.log('🔍 Debug - Final payload being sent:', payload);

      await postAPI.update(id, payload);
      toast.success('Post updated successfully!');
      navigate('/');
    } catch (e) {
      console.error('🔍 Debug - Error updating post:', e);
      const errorMsg = e.response?.data?.reason || e.response?.data?.message || 'Failed to update post.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const getSelectedCommunityName = () => {
    const community = allCommunities.find(c => c.id === selectedCommunity);
    return community ? `c/${community.name}` : 'Choose a community...';
  };

  const CommunitySelector = () => (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
        <button
          onClick={() => setCommunityFilter('all')}
          className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
            communityFilter === 'all' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="h-4 w-4 mr-2 inline" />
          All
        </button>
        <button
          onClick={() => setCommunityFilter('college')}
          className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
            communityFilter === 'college' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="h-4 w-4 mr-2 inline" />
          College
        </button>
        <button
          onClick={() => setCommunityFilter('created')}
          className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
            communityFilter === 'created' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Crown className="h-4 w-4 mr-2 inline" />
          Mine
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          value={communitySearch}
          onChange={(e) => setCommunitySearch(e.target.value)}
          className="pl-9 bg-muted/50 border-0 focus:bg-background"
        />
      </div>

      {/* Community List */}
      <div className="max-h-60 overflow-y-auto space-y-1">
        {getFilteredCommunities().map(community => (
          <button
            key={community.id}
            onClick={() => {
              setSelectedCommunity(community.id);
              setShowCommunitySelector(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted/50 ${
              selectedCommunity === community.id ? 'bg-primary/10 border border-primary/20' : ''
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={community.logoUrl} />
              <AvatarFallback>{community.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">c/{community.name}</span>
                {community.isNsfw && (
                  <span className="text-red-500 text-xs bg-red-100 px-1 rounded">NSFW</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {community.memberCount || 0} members
              </p>
            </div>
          </button>
        ))}
        {getFilteredCommunities().length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No communities found</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">Update your post content and settings</p>
        </div>

        {/* Main Content */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Community Selector */}
          <div className="p-6 border-b border-border">
            <DropdownMenu open={showCommunitySelector} onOpenChange={setShowCommunitySelector}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-12 px-0 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {selectedCommunity && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={allCommunities.find(c => c.id === selectedCommunity)?.logoUrl} />
                        <AvatarFallback>
                          {allCommunities.find(c => c.id === selectedCommunity)?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className={selectedCommunity ? 'font-medium' : 'text-muted-foreground'}>
                      {getSelectedCommunityName()}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 p-4" align="start">
                <CommunitySelector />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Tabs */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="text" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Type className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Image className="h-4 w-4" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Video className="h-4 w-4" />
                  Video
                </TabsTrigger>
              </TabsList>
              
              <div className="space-y-4">
                {/* Content Input */}
                <Textarea 
                  value={caption} 
                  onChange={e => setCaption(e.target.value)} 
                  placeholder="What's happening?"
                  className="min-h-[120px] resize-none border-0 focus:ring-0 text-lg bg-transparent placeholder:text-muted-foreground"
                />
                
                {/* Media Upload */}
                {activeTab === 'image' && (
                  <div>
                    <input 
                      ref={imageInputRef} 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileSelect(e, 'image')} 
                    />
                    <Button 
                      variant="ghost" 
                      onClick={() => imageInputRef.current.click()}
                      className="w-full h-12 hover:bg-muted/50"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Add Images
                    </Button>
                  </div>
                )}
                
                {activeTab === 'video' && (
                  <div>
                    <input 
                      ref={videoInputRef} 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => handleFileSelect(e, 'video')} 
                    />
                    <Button 
                      variant="ghost" 
                      onClick={() => videoInputRef.current.click()}
                      className="w-full h-12 hover:bg-muted/50"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Add Video
                    </Button>
                  </div>
                )}

                {/* Media Previews */}
                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mediaPreviews.map((p, i) => (
                      <div key={i} className="relative aspect-square">
                        <img 
                          src={p.url} 
                          className="w-full h-full object-cover rounded-lg" 
                          alt="Preview"
                        />
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="absolute top-2 right-2 h-6 w-6 p-0" 
                          onClick={() => removeMedia(i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Settings */}
                <div className="flex justify-end pt-4 border-t border-border/50">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="nsfw-switch" 
                      checked={isNsfw} 
                      onCheckedChange={setIsNsfw} 
                    />
                    <Label htmlFor="nsfw-switch" className="flex items-center gap-1 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      NSFW
                    </Label>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/20">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !selectedCommunity}
              className="px-8 bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading...' : isSubmitting ? 'Updating...' : 'Update Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage; 