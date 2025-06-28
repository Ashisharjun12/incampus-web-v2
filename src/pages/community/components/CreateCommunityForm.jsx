import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { communityAPI, uploadAPI } from '@/api/api';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authstore';
import { X, Check, ArrowLeft, ArrowRight } from 'lucide-react';

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
                setStep(1); 
                setCreatedCommunity(community); 
            } else {
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

            let response;
            if (isEditMode) {
                response = await communityAPI.update(community.id, communityData);
                toast.success('Community updated successfully!');
                if (onCommunitySaved) onCommunitySaved();
                onOpenChange(false);
            } else {
                response = await communityAPI.create(communityData);
                if (response.data.success && response.data.data) {
                    toast.success('Community created! Now, add some topics.');
                    setCreatedCommunity(response.data.data);
                    setStep(3);
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

    const handleClose = () => {
        if (formData.logoUrl && formData.logoUrl.startsWith('blob:')) URL.revokeObjectURL(formData.logoUrl);
        if (formData.bannerUrl && formData.bannerUrl.startsWith('blob:')) URL.revokeObjectURL(formData.bannerUrl);
        onOpenChange(false);
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
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEditMode ? `Edit c/${community.name}` : 'Create a community'}
                    </DialogTitle>
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
                            <div key={s} className={`h-2 w-2 rounded-full transition-colors ${
                                step === s ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                            }`} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {step > 1 && (
                            <Button 
                                variant="outline" 
                                onClick={() => setStep(step - 1)} 
                                disabled={isSubmitting}
                                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                          )}
                          {step === 1 && (
                            <Button 
                                onClick={() => setStep(2)}
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                            >
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                          {step === 2 && (
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || !formData.name || !formData.description}
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create & Next'}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                          {step === 3 && (
                            <Button 
                                onClick={handleFinishCreation} 
                                disabled={isSubmitting}
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Finish'}
                                <Check className="h-4 w-4 ml-2" />
                            </Button>
                          )}
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
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Edit c/{community.name}
                    </DialogTitle>
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
                            <div key={s} className={`h-2 w-2 rounded-full transition-colors ${
                                step === s ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                            }`} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {step > 1 && (
                            <Button 
                                variant="outline" 
                                onClick={() => setStep(step - 1)} 
                                disabled={isSubmitting}
                                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                          )}
                          {step < 3 && (
                            <Button 
                                onClick={() => setStep(step + 1)}
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                            >
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                          {step === 3 && (
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || !formData.name || !formData.description}
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                <Check className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                    </div>
                </DialogFooter>
            </>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] w-full p-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-6 flex flex-col">
                        {isEditMode ? renderEditMode() : renderCreateMode()}
                    </div>

                    <div className="hidden lg:flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-8 border-l border-gray-200 dark:border-gray-800">
                        {/* Live Preview Pane */}
                         <div className="w-full max-w-xs bg-white dark:bg-black rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                           <div className="h-24 bg-gray-200 dark:bg-gray-800 relative" style={{ 
                               backgroundImage: formData.bannerUrl ? `url(${formData.bannerUrl})` : 'none', 
                               backgroundSize: 'cover', 
                               backgroundPosition: 'center' 
                           }}>
                               {!formData.bannerUrl && (
                                   <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                                       <span className="text-sm">Banner preview</span>
                                   </div>
                               )}
                           </div>
                           <div className="p-4">
                               <div className="flex items-center gap-3 -mt-8">
                                   <Avatar className="h-16 w-16 border-4 border-white dark:border-black shadow-sm">
                                       <AvatarImage src={formData.logoUrl} />
                                       <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-lg font-semibold">
                                           {formData.name?.charAt(0).toUpperCase() || 'C'}
                                       </AvatarFallback>
                                   </Avatar>
                               </div>
                                <div className="mt-3">
                                     <div className="flex items-center gap-2 mb-1">
                                         {formData.isNsfw && <Badge variant="destructive" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">NSFW</Badge>}
                                         <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                                             c/{formData.name || 'CommunityName'}
                                         </h3>
                                     </div>
                                     <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                         {formData.description || 'Community description will appear here.'}
                                     </p>
                                </div>
                                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-500">
                                   <span>{community?.memberCount || 1} member{community?.memberCount !== 1 && 's'}</span>
                                   <span>•</span>
                                   <span>1 online</span>
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
                
                {/* Close button */}
                <DialogClose asChild>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleClose} 
                        className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2"
                    >
                      
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCommunityForm; 