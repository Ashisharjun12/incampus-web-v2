import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { communityAPI, collegeAPI, uploadAPI } from '@/api/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import VerifiedBadge from '@/components/ui/verified-badge';
import NSFWBadge from '@/components/ui/nsfw-badge';
import topicsData from '@/data/topics.json';

const communitySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  collegeId: z.string().min(1, 'Please select a college'),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bannerUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isNsfw: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  isVerified: z.boolean().default(true),
  isAdminCreated: z.boolean().default(true),
  topics: z.array(z.string()).default([])
});

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [deletingCommunity, setDeletingCommunity] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('all');

  const { control, handleSubmit, register, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: '',
      description: '',
      collegeId: '',
      logoUrl: '',
      bannerUrl: '',
      isNsfw: false,
      isPrivate: false,
      isVerified: true,
      isAdminCreated: true,
      topics: []
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [communitiesResponse, collegesResponse] = await Promise.all([
        communityAPI.getAll(),
        collegeAPI.getAll()
      ]);

      if (communitiesResponse.data.success) {
        setCommunities(communitiesResponse.data.data);
      }
      if (collegesResponse.data.success) {
        setColleges(collegesResponse.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (showCreateDialog) {
      if (editingCommunity) {
        reset({
          name: editingCommunity.name,
          description: editingCommunity.description,
          collegeId: editingCommunity.collegeId || '',
          logoUrl: editingCommunity.logoUrl || '',
          bannerUrl: editingCommunity.bannerUrl || '',
          isNsfw: editingCommunity.isNsfw || false,
          isPrivate: editingCommunity.isPrivate || false,
          isVerified: editingCommunity.isVerified || false,
          isAdminCreated: editingCommunity.isAdminCreated || false,
          topics: editingCommunity.topics || []
        });
        setLogoPreview(editingCommunity.logoUrl || '');
        setBannerPreview(editingCommunity.bannerUrl || '');
      } else {
        reset({
          name: '',
          description: '',
          collegeId: '',
          logoUrl: '',
          bannerUrl: '',
          isNsfw: false,
          isPrivate: false,
          isVerified: true,
          isAdminCreated: true,
          topics: []
        });
        setLogoPreview('');
        setBannerPreview('');
      }
    }
  }, [showCreateDialog, editingCommunity, reset]);

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size cannot exceed 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file, '/uploads/communities');
      const imageUrl = response.data.data.url;
      setValue(type === 'logo' ? 'logoUrl' : 'bannerUrl', imageUrl, { shouldValidate: true });
      if (type === 'logo') {
        setLogoPreview(imageUrl);
      } else {
        setBannerPreview(imageUrl);
      }
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully`);
    } catch (error) {
      toast.error(`${type === 'logo' ? 'Logo' : 'Banner'} upload failed`);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      let response;
      if (editingCommunity) {
        response = await communityAPI.update(editingCommunity.id, data);
        toast.success('Community updated successfully');
      } else {
        response = await communityAPI.create(data);
        toast.success('Community created successfully');
      }
      setShowCreateDialog(false);
      setEditingCommunity(null);
      loadData(); // Refresh the list after create/update
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deletingCommunity) return;
    try {
      await communityAPI.delete(deletingCommunity.id);
      toast.success('Community deleted successfully');
      setCommunities(prev => prev.filter(c => c.id !== deletingCommunity.id));
      setDeletingCommunity(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete community');
    }
  };

  const openCreateDialog = () => {
    setEditingCommunity(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (community) => {
    setEditingCommunity(community);
    setShowCreateDialog(true);
  };

  const getCollegeName = (collegeId) => {
    const college = colleges.find(c => c.id === collegeId);
    return college ? college.name : 'Unknown College';
  };

  // Filter communities by selected college
  const filteredCommunities = selectedCollegeId && selectedCollegeId !== 'all'
    ? communities.filter(community => community.collegeId === selectedCollegeId)
    : communities;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Community Management</h1>
          <p className="text-muted-foreground">Create and manage all communities (user-created and admin-created)</p>
        </div>
        <Button onClick={openCreateDialog}>Create Community</Button>
      </div>

      {/* College Filter */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
        <Label htmlFor="collegeFilter" className="font-medium">Filter by College:</Label>
        <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Colleges" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {colleges.map((college) => (
              <SelectItem key={college.id} value={college.id}>
                {college.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCollegeId && selectedCollegeId !== 'all' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedCollegeId('all')}
          >
            Clear Filter
          </Button>
        )}
        <div className="text-sm text-muted-foreground">
          Showing {filteredCommunities.length} of {communities.length} communities
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCommunities.map((community) => (
          <div key={community.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={community.logoUrl} alt={community.name} />
              <AvatarFallback>{community.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">c/{community.name}</h3>
                {community.isVerified && (
                  <VerifiedBadge size="small" className="mr-1" />
                )}
                {community.isNsfw && (
                  <NSFWBadge size="small" className="mr-1" />
                )}
                {community.isPrivate && <Badge variant="secondary">Private</Badge>}
                {community.isAdminCreated && <Badge variant="outline">Admin Created</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{community.description}</p>
              <p className="text-sm text-muted-foreground">
                {getCollegeName(community.collegeId)} • {community.memberCount || 0} members
                {community.topics && community.topics.length > 0 && (
                  <span> • Topics: {community.topics.slice(0, 3).join(', ')}{community.topics.length > 3 ? '...' : ''}</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(community)}>
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeletingCommunity(community)}
                className="text-red-600 hover:text-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCommunity ? 'Edit Community' : 'Create Community'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="collegeId">College</Label>
                <Controller
                  name="collegeId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a college" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.collegeId && <p className="text-sm text-red-500">{errors.collegeId.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    id="description"
                    {...field}
                    className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none"
                  />
                )}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Community Logo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={logoPreview} alt="Community Logo" />
                  <AvatarFallback>{control._getWatch('name')?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <Input 
                  id="logo" 
                  type="file" 
                  onChange={(e) => handleFileChange(e, 'logo')} 
                  accept="image/*" 
                  className="max-w-xs" 
                  disabled={isUploading}
                />
              </div>
              {isUploading && <p className="text-sm text-blue-500">Uploading logo...</p>}
              <Input {...register('logoUrl')} className="hidden" />
              {errors.logoUrl && <p className="text-sm text-red-500">{errors.logoUrl.message}</p>}
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label htmlFor="banner">Community Banner</Label>
              <div className="flex items-center gap-4">
                {bannerPreview && (
                  <div className="h-16 w-32 rounded border overflow-hidden">
                    <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <Input 
                  id="banner" 
                  type="file" 
                  onChange={(e) => handleFileChange(e, 'banner')} 
                  accept="image/*" 
                  className="max-w-xs" 
                  disabled={isUploading}
                />
              </div>
              {isUploading && <p className="text-sm text-blue-500">Uploading banner...</p>}
              <Input {...register('bannerUrl')} className="hidden" />
              {errors.bannerUrl && <p className="text-sm text-red-500">{errors.bannerUrl.message}</p>}
            </div>

            {/* Topics Selection */}
            <div className="space-y-2">
              <Label>Topics</Label>
              <Controller
                name="topics"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {Object.entries(topicsData).map(([category, data]) => (
                      <div key={category} className="space-y-1">
                        <h4 className="text-sm font-medium">{data.icon} {category}</h4>
                        <div className="flex flex-wrap gap-1">
                          {data.topics.map((topic) => (
                            <label key={topic} className="flex items-center space-x-1 text-xs">
                              <input
                                type="checkbox"
                                checked={field.value.includes(topic)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, topic]);
                                  } else {
                                    field.onChange(field.value.filter(t => t !== topic));
                                  }
                                }}
                                className="rounded"
                              />
                              <span>{topic}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.topics && <p className="text-sm text-red-500">{errors.topics.message}</p>}
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="isVerified"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isVerified"
                      checked={!!field.value}
                      onCheckedChange={val => field.onChange(!!val)}
                    />
                  )}
                />
                <Label htmlFor="isVerified">Verified (Blue Badge)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="isNsfw"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isNsfw"
                      checked={!!field.value}
                      onCheckedChange={val => field.onChange(!!val)}
                    />
                  )}
                />
                <Label htmlFor="isNsfw">NSFW Content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="isPrivate"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isPrivate"
                      checked={!!field.value}
                      onCheckedChange={val => field.onChange(!!val)}
                    />
                  )}
                />
                <Label htmlFor="isPrivate">Private Community</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="isAdminCreated"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isAdminCreated"
                      checked={!!field.value}
                      onCheckedChange={val => field.onChange(!!val)}
                    />
                  )}
                />
                <Label htmlFor="isAdminCreated">Admin Created</Label>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? 'Saving...' : (editingCommunity ? 'Update Community' : 'Create Community')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCommunity} onOpenChange={() => setDeletingCommunity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <strong>c/{deletingCommunity?.name}</strong> community and all of its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Communities; 