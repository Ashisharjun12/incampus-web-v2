import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { collegeAPI, uploadAPI } from '@/api/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const collegeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const CollegeForm = ({ open, onOpenChange, college, onSave }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  const { control, handleSubmit, register, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(collegeSchema),
    defaultValues: {
      name: '',
      location: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (college) {
      reset({
        name: college.name,
        location: college.location,
        logoUrl: college.logoUrl || '',
      });
      setLogoPreview(college.logoUrl || '');
    } else {
      reset({ name: '', location: '', logoUrl: '' });
      setLogoPreview('');
    }
  }, [college, reset, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset({ name: '', location: '', logoUrl: '' });
      setLogoPreview('');
    }
  }, [open, reset]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for logos
      toast.error('Logo size cannot exceed 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file, '/uploads/colleges');
      const imageUrl = response.data.data.url;
      setValue('logoUrl', imageUrl, { shouldValidate: true });
      setLogoPreview(imageUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Logo upload failed');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const onSubmit = async (data) => {
    try {
      let response;
      if (college) {
        response = await collegeAPI.update(college.id, data);
        toast.success('College updated successfully');
      } else {
        response = await collegeAPI.create(data);
        toast.success('College created successfully');
      }
      onSave(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{college ? 'Edit College' : 'Add New College'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">College Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">College Logo</Label>
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={logoPreview} alt="College Logo" />
                    <AvatarFallback>{control._getWatch('name')?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <Input id="logo" type="file" onChange={handleFileChange} accept="image/*" className="max-w-xs" disabled={isUploading}/>
            </div>
            {isUploading && <p className="text-sm text-blue-500">Uploading logo...</p>}
            <Input {...register('logoUrl')} className="hidden" />
            {errors.logoUrl && <p className="text-sm text-red-500">{errors.logoUrl.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Saving...' : 'Save College'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollegeForm; 