import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { uploadAPI, communityAPI, postAPI, authAPI } from '@/api/api';
import { useAuthStore } from '@/store/authstore';
import MentionInput from '@/components/ui/MentionInput';
import { 
    Image, 
    Video, 
    X, 
    Loader2, 
    AlertTriangle, 
    ChevronDown, 
    Eye, 
    Paperclip, 
    Smile, 
    Send
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
    const [caption, setCaption] = useState('');
    const [selectedCommunity, setSelectedCommunity] = useState('');
    const [isNsfw, setIsNsfw] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [allCommunities, setAllCommunities] = useState([]);
    const [communitySearch, setCommunitySearch] = useState('');
    const [showCommunitySelector, setShowCommunitySelector] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [communityTab, setCommunityTab] = useState('all'); // 'all', 'mine', 'college'

    useEffect(() => {
        if (open) {
            loadUserProfileAndCommunities();
        }
    }, [open]);

    const loadUserProfileAndCommunities = async () => {
        try {
            const profileResponse = await authAPI.getProfile();
            if (profileResponse.data.success) {
                setUserProfile(profileResponse.data.data);
            }
            const allResponse = await communityAPI.getAll();
            if (allResponse.data.success) {
                setAllCommunities(allResponse.data.data);
            }
            const userResponse = await communityAPI.getUserCommunities();
            if (userResponse.data.success) {
                setCommunities(userResponse.data.data);
            }
        } catch (error) {
            toast.error('Failed to load communities.');
        }
    };

    const getFilteredCommunities = () => {
        let filtered = allCommunities;
        if (communityTab === 'mine') {
            filtered = filtered.filter(c => c.createdById === authUser?.id);
        } else if (communityTab === 'college' && userProfile?.collegeId) {
            filtered = filtered.filter(c => c.collegeId === userProfile.collegeId);
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

    // --- Threads-style UI ---
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl w-full p-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg">
                <div className="flex flex-col w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Create Post</DialogTitle>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" onClick={handleClose} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2">
                               
                            </Button>
                        </DialogClose>
                    </div>
                    {/* Main content */}
                    <div className="flex px-5 pt-4 pb-2">
                        {/* Avatar and thread line */}
                        <div className="flex flex-col items-center mr-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={authUser?.avatarUrl || authUser?.googleAvatarUrl} />
                                <AvatarFallback className="bg-gray-200 text-gray-600 font-bold">
                                    {authUser?.username?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 w-px bg-gray-200 dark:bg-gray-800 mt-1" style={{ minHeight: 60 }} />
                        </div>
                        {/* Input and media */}
                        <div className="flex-1 flex flex-col">
                            {/* Community tabs and selector */}
                            <div className="mb-2">
                                <div className="flex gap-2 mb-2">
                                    {['all', 'mine', 'college'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setCommunityTab(tab)}
                                            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-150 focus:outline-none
                                                ${communityTab === tab ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                                        >
                                            {tab === 'all' ? 'All' : tab === 'mine' ? 'Mine' : 'College'}
                                        </button>
                                    ))}
                                </div>
                                <DropdownMenu open={showCommunitySelector} onOpenChange={setShowCommunitySelector}>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-between h-10 px-3 text-sm font-normal border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                        >
                                            <span className={selectedCommunity ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                                                {getSelectedCommunityName()}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-80 p-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg" align="start">
                                        <Input
                                            placeholder="Search communities..."
                                            value={communitySearch}
                                            onChange={(e) => setCommunitySearch(e.target.value)}
                                            className="mb-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                                        />
                                        <div className="max-h-56 overflow-y-auto">
                                            {getFilteredCommunities().map(community => (
                                                <button
                                                    key={community.id}
                                                    onClick={() => {
                                                        setSelectedCommunity(community.id);
                                                        setShowCommunitySelector(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedCommunity === community.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                                >
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={community.logoUrl} />
                                                        <AvatarFallback>{community.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="truncate">c/{community.name}</span>
                                                </button>
                                            ))}
                                            {getFilteredCommunities().length === 0 && (
                                                <div className="text-center py-4 text-gray-400 text-sm">No communities found</div>
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {/* MentionInput instead of Textarea */}
                            <MentionInput
                                value={caption}
                                onChange={setCaption}
                                placeholder="Start a thread..."
                                className="w-full min-h-[90px] border-none bg-transparent text-lg focus:ring-0 focus:outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                showGifButton={false}
                                showPostButton={false}
                            />
                            {/* Media preview */}
                            {mediaPreviews.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                    {mediaPreviews.map((p, i) => (
                                        <div key={i} className="relative">
                                            <img 
                                                src={p.url} 
                                                className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" 
                                                alt="Preview"
                                            />
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700"
                                                onClick={() => removeMedia(i)}
                                            >
                                                <X className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* NSFW warning */}
                    {isNsfw && (
                        <Alert className="mx-5 mb-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <AlertDescription className="text-yellow-800 dark:text-yellow-200 font-medium">
                                <strong>NSFW Content Warning:</strong> You've enabled NSFW mode. This allows you to post 18+ content.<br/> Please comply with guidelines.
                            </AlertDescription>
                        </Alert>
                    )}
                    {/* Action row */}
                    <div className="flex items-center gap-3 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black rounded-b-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => imageInputRef.current.click()}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Add image"
                        >
                            <Image className="h-5 w-5 text-gray-500" />
                        </Button>
                        <input 
                            ref={imageInputRef} 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileSelect(e, 'image')} 
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => videoInputRef.current.click()}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Add video"
                        >
                            <Video className="h-5 w-5 text-gray-500" />
                        </Button>
                        <input 
                            ref={videoInputRef} 
                            type="file" 
                            accept="video/*" 
                            className="hidden" 
                            onChange={(e) => handleFileSelect(e, 'video')} 
                        />
                        <div className="flex-1" />
                        <div className="flex items-center gap-2">
                            <Switch 
                                id="nsfw-switch" 
                                checked={isNsfw} 
                                onCheckedChange={setIsNsfw}
                                className="data-[state=checked]:bg-yellow-500"
                            />
                            <Label htmlFor="nsfw-switch" className="text-xs text-gray-500 dark:text-gray-400">NSFW</Label>
                        </div>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isLoading || !selectedCommunity}
                            className="ml-2 px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-base shadow-none border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Post'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePostModal; 