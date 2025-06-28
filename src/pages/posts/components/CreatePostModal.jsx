import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { uploadAPI, communityAPI, postAPI, authAPI } from '@/api/api';
import { useAuthStore } from '@/store/authstore';
import MentionInput from '@/components/ui/MentionInput';
import { 
    Type, 
    Image, 
    Video, 
    X, 
    Loader2, 
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
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CreatePostModal = ({ open, onOpenChange, onPostCreated }) => {
    const { authUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('text');
    
    // Form state
    const [caption, setCaption] = useState('');
    const [selectedCommunity, setSelectedCommunity] = useState('');
    const [isNsfw, setIsNsfw] = useState(false);
    
    // Media state
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    
    // Community state
    const [communities, setCommunities] = useState([]);
    const [allCommunities, setAllCommunities] = useState([]);
    const [userCreatedCommunities, setUserCreatedCommunities] = useState([]);
    const [collegeCommunities, setCollegeCommunities] = useState([]);
    const [communityFilter, setCommunityFilter] = useState('all'); // 'all', 'college', 'created'
    const [communitySearch, setCommunitySearch] = useState('');
    const [showCommunitySelector, setShowCommunitySelector] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    useEffect(() => {
        if (open) {
            loadUserProfileAndCommunities();
        }
    }, [open]);

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
            type: file.type
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
        URL.revokeObjectURL(mediaPreviews[index].url);
        setMediaFiles(files => files.filter((_, i) => i !== index));
        setMediaPreviews(previews => previews.filter((_, i) => i !== index));
    };

    const handleClose = () => {
        mediaPreviews.forEach(p => URL.revokeObjectURL(p.url));
        setCaption('');
        setSelectedCommunity('');
        setIsNsfw(false);
        setMediaFiles([]);
        setMediaPreviews([]);
        setIsLoading(false);
        setIsUploading(false);
        setShowCommunitySelector(false);
        setCommunitySearch('');
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        if (!selectedCommunity) return toast.error('Please select a community.');
        if (!caption && mediaFiles.length === 0) return toast.error('Your post has no content.');

        setIsLoading(true);
        setIsUploading(true);

        try {
            let imageUrls = [];
            let videoUrls = [];

            if (mediaFiles.length > 0) {
                const imageBlobs = mediaFiles.filter(f => f.type === 'image').map(f => f.file);
                const videoBlobs = mediaFiles.filter(f => f.type === 'video').map(f => f.file);
                
                if (imageBlobs.length > 0) {
                    const res = await uploadAPI.uploadImages(imageBlobs, 'posts');
                    imageUrls = res.data.data.map(item => item.url);
                }
                if (videoBlobs.length > 0) {
                    const res = await uploadAPI.uploadVideo(videoBlobs[0], 'posts');
                    videoUrls = [res.data.data.url];
                }
            }
            setIsUploading(false);

            const payload = {
                caption,
                communityId: selectedCommunity,
                images: imageUrls,
                videos: videoUrls,
                isNsfw,
            };

            const response = await postAPI.create(payload);
            console.log('🔄 CreatePostModal: API response:', response.data);
            toast.success('Post created successfully!');
            onPostCreated?.(response.data.data);
            handleClose();

        } catch (error) {
            const errorMsg = error.response?.data?.reason || error.response?.data?.message || 'Failed to create post.';
            toast.error(errorMsg);
            setIsLoading(false);
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
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl shadow-2xl border-0 rounded-3xl">
                <DialogHeader className="pb-4 border-b border-border/50">
                    <DialogTitle className="text-xl font-semibold">New Post</DialogTitle>
                </DialogHeader>
                {/* All content, no extra flex/scroll wrappers */}
                {/* Community Selector */}
                <div className="mb-4 pt-4">
                    <DropdownMenu open={showCommunitySelector} onOpenChange={setShowCommunitySelector}>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="w-full justify-between h-12 px-0 hover:bg-white/60 dark:hover:bg-gray-900/60 rounded-xl shadow"
                            >
                                <div className="flex items-center gap-2">
                                    {selectedCommunity && (
                                        <Avatar className="h-10 w-10 shadow border-2 border-white dark:border-gray-800">
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
                        <DropdownMenuContent className="w-96 p-4 bg-white/80 dark:bg-[#23272f]/80 backdrop-blur-xl shadow-xl rounded-2xl border-0" align="start">
                            <CommunitySelector />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                    <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50">
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
                        <div className="relative">
                            <MentionInput
                                value={caption}
                                onChange={setCaption}
                                placeholder="What's happening?"
                                className="min-h-[120px] resize-none border-0 focus:ring-0 text-lg bg-transparent placeholder:text-muted-foreground"
                                showGifButton={false}
                                showPostButton={false}
                            />
                        </div>
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
                                    className="w-full h-12 hover:bg-white/60 dark:hover:bg-gray-900/60 rounded-xl shadow"
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
                                    className="w-full h-12 hover:bg-white/60 dark:hover:bg-gray-900/60 rounded-xl shadow"
                                >
                                    <Video className="h-4 w-4 mr-2" />
                                    Add Video
                                </Button>
                            </div>
                        )}
                        {/* Media Previews */}
                        {mediaPreviews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {mediaPreviews.map((p, i) => (
                                    <div key={i} className="relative aspect-square">
                                        <img 
                                            src={p.url} 
                                            className="w-full h-full object-cover rounded-xl shadow-lg" 
                                            alt="Preview"
                                        />
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full shadow"
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
                <DialogFooter className="pt-4 border-t-0 bg-white/60 dark:bg-[#23272f]/60 backdrop-blur-xl rounded-b-3xl shadow-lg">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isLoading || !selectedCommunity}
                       
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isUploading ? 'Uploading...' : isLoading ? 'Posting...' : 'Post'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePostModal; 