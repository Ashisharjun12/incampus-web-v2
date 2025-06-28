import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { communityAPI, uploadAPI } from '@/api/api';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authstore';

// Import steps
import Step1Details from './CreateCommunity/Step1Details';
import Step2Style from './CreateCommunity/Step2Style';
import Step3Topics from './CreateCommunity/Step3Topics';

const CreateCommunityForm = ({ open, onOpenChange, onCommunitySaved, community = null }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdCommunity, setCreatedCommunity] = useState(null);
    const { authUser } = useAuthStore();
    const isAdmin = authUser?.role === 'admin';
    
    const isEditMode = useMemo(() => community !== null, [community]);

    const initialFormData = useMemo(() => ({
        name: '',
        description: '',
        logoUrl: '',
        bannerUrl: '',
        logoFile: null,
        bannerFile: null,
        isNsfw: false,
        isPrivate: false,
        topics: [],
        isVerified: false,
        isAdminCreated: false
    }), []);

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (open) {
            if (isEditMode && community) {
                setFormData({
                    name: community.name || '',
                    description: community.description || '',
                    logoUrl: community.logoUrl || '',
                    bannerUrl: community.bannerUrl || '',
                    logoFile: null,
                    bannerFile: null,
                    isNsfw: community.isNsfw || false,
                    isPrivate: community.isPrivate || false,
                    topics: community.topics || [],
                    isVerified: community.isVerified || false,
                    isAdminCreated: community.isAdminCreated || false
                });
                // In edit mode, we want to use steps.
                setStep(1); 
                setCreatedCommunity(community); 
            } else {
                 // Revoke previous blob URLs before resetting
                if (formData.logoUrl && formData.logoUrl.startsWith('blob:')) URL.revokeObjectURL(formData.logoUrl);
                if (formData.bannerUrl && formData.bannerUrl.startsWith('blob:')) URL.revokeObjectURL(formData.bannerUrl);
                setFormData(initialFormData);
                setStep(1);
                setCreatedCommunity(null);
            }
        }
    }, [open, isEditMode, community, initialFormData]);


    const handleFileChange = (file, type) => {
        let urlKey, fileKey;
        if (type === 'logo' || type === 'icon') {
            urlKey = 'logoUrl';
            fileKey = 'logoFile';
        } else if (type === 'banner') {
            urlKey = 'bannerUrl';
            fileKey = 'bannerFile';
        } else {
            return;
        }
        const currentUrl = formData[urlKey];
        if (currentUrl && currentUrl.startsWith('blob:')) {
            URL.revokeObjectURL(currentUrl);
        }
        if (file) {
            const blobUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                [fileKey]: file,
                [urlKey]: blobUrl
            }));
        }
    };
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 1. Upload files if they exist
            let finalLogoUrl = formData.logoUrl;
            let finalBannerUrl = formData.bannerUrl;

            if (formData.logoFile) {
                const uploadResponse = await uploadAPI.uploadImage(formData.logoFile, 'community-assets');
                finalLogoUrl = uploadResponse.data.data.url;
            }
            if (formData.bannerFile) {
                const uploadResponse = await uploadAPI.uploadImage(formData.bannerFile, 'community-assets');
                finalBannerUrl = uploadResponse.data.data.url;
            }

            // 2. Prepare data
            const communityData = {
                name: formData.name,
                description: formData.description,
                logoUrl: finalLogoUrl,
                bannerUrl: finalBannerUrl,
                isNsfw: formData.isNsfw,
                isPrivate: formData.isPrivate,
                topics: formData.topics
            };
            if (isAdmin) {
                communityData.isVerified = formData.isVerified;
                communityData.isAdminCreated = formData.isAdminCreated;
            }

            // 3. Create or Update community
            let response;
            if (isEditMode) {
                response = await communityAPI.update(community.id, communityData);
                toast.success('Community updated successfully!');
                if (onCommunitySaved) onCommunitySaved();
                onOpenChange(false);
            } else {
                // In create mode, we use steps
                // This function is now only for step 2 of creation
                response = await communityAPI.create(communityData);
                if (response.data.success && response.data.data) {
                    toast.success('Community created! Now, add some topics.');
                    setCreatedCommunity(response.data.data);
                    setStep(3); // Move to topics step
                } else {
                     toast.error(response.data.message || 'Failed to create community');
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinishCreation = async () => {
        if (!createdCommunity) {
            toast.error("Community not found. Cannot add topics.");
            return;
        }
        setIsSubmitting(true);
        try {
            if (formData.topics.length > 0) {
                await communityAPI.addOrUpdateTopics(createdCommunity.id, formData.topics);
            }
            toast.success("Community setup complete!");
            if (onCommunitySaved) onCommunitySaved();
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    const renderCreateMode = () => {
         const steps = [
            { key: 1, component: <Step1Details formData={formData} setFormData={setFormData} /> },
            { key: 2, component: <Step2Style formData={formData} onFileChange={handleFileChange} /> },
            { key: 3, component: <Step3Topics formData={formData} setFormData={setFormData} /> }
        ];
        return (
            <>
                <DialogHeader className="mb-6">
                    <DialogTitle>Create a community</DialogTitle>
                </DialogHeader>
                <div className="flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {steps.find(s => s.key === step).component}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <DialogFooter className="mt-6">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex gap-1">
                          {[1, 2, 3].map(s => (
                            <div key={s} className={`h-2 w-2 rounded-full ${step === s ? 'bg-primary' : 'bg-muted'}`} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={isSubmitting}>Back</Button>}
                          {step === 1 && <Button onClick={() => setStep(2)}>Next</Button>}
                          {step === 2 && <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.description}>
                              {isSubmitting ? 'Creating...' : 'Create & Next'}
                          </Button>}
                          {step === 3 && <Button onClick={handleFinishCreation} disabled={isSubmitting}>
                              {isSubmitting ? 'Saving...' : 'Finish'}
                          </Button>}
                        </div>
                    </div>
                </DialogFooter>
            </>
        )
    }

    const renderEditMode = () => {
        const steps = [
            { key: 1, component: <Step1Details formData={formData} setFormData={setFormData} /> },
            { key: 2, component: <Step2Style formData={formData} onFileChange={handleFileChange} /> },
            { key: 3, component: <Step3Topics formData={formData} setFormData={setFormData} /> }
        ];
        
        return (
            <>
                <DialogHeader className="mb-6">
                    <DialogTitle>Edit c/{community.name}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {steps.find(s => s.key === step).component}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <DialogFooter className="mt-6">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex gap-1">
                          {[1, 2, 3].map(s => (
                            <div key={s} className={`h-2 w-2 rounded-full ${step === s ? 'bg-primary' : 'bg-muted'}`} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={isSubmitting}>Back</Button>}
                          {step < 3 && <Button onClick={() => setStep(step + 1)}>Next</Button>}
                          {step === 3 && <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.description}>
                              {isSubmitting ? 'Saving...' : 'Save Changes'}
                          </Button>}
                        </div>
                    </div>
                </DialogFooter>
            </>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] w-full p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 flex flex-col">
                        {isEditMode ? renderEditMode() : renderCreateMode()}
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center bg-muted/50 p-8">
                        {/* Live Preview Pane */}
                         <div className="w-full max-w-xs bg-background dark:bg-neutral-800/50 rounded-lg shadow-md overflow-hidden">
                           <div className="h-20 bg-muted" style={{ backgroundImage: `url(${formData.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                           <div className="p-4">
                               <div className="flex items-center gap-3 -mt-8">
                                   <Avatar className="h-14 w-14 border-4 border-background dark:border-neutral-800/50">
                                       <AvatarImage src={formData.logoUrl} />
                                       <AvatarFallback>{formData.name?.charAt(0).toUpperCase() || 'C'}</AvatarFallback>
                                   </Avatar>
                               </div>
                                <div className="mt-2">
                                     <div className="flex items-center gap-2">
                                         {formData.isNsfw && <Badge variant="destructive" className="font-bold">NSFW</Badge>}
                                         <h3 className="font-bold text-md truncate">c/{formData.name || 'CommunityName'}</h3>
                                     </div>
                                     <p className="text-sm text-muted-foreground mt-2 truncate">
                                         {formData.description || 'Community description will appear here.'}
                                     </p>
                                </div>
                                <div className="text-xs text-muted-foreground mt-3">
                                   {community?.memberCount || 1} member{community?.memberCount !== 1 && 's'} • 1 online
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCommunityForm; 