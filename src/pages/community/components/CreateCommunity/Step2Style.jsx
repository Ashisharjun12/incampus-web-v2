import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Image as ImageIcon, User as UserIcon } from 'lucide-react';

const Step2Style = ({ formData, onFileChange }) => {
    const iconInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const handleFileSelect = (event, type) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size cannot exceed 2MB');
            return;
        }
        onFileChange(file, type);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Style your community</h3>
                <p className="text-sm text-muted-foreground">
                    Add a banner and icon to make your community stand out.
                </p>
            </div>
            <div className="space-y-4">
                {/* Banner Upload */}
                <div>
                    <Label>Banner</Label>
                    <div className="flex items-center gap-4">
                        {formData.bannerUrl && (
                            <img src={formData.bannerUrl} alt="Banner Preview" className="h-12 w-32 object-cover rounded border" />
                        )}
                        <input
                            type="file"
                            ref={bannerInputRef}
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, 'banner')}
                            accept="image/*"
                        />
                        <Button variant="outline" size="sm" onClick={() => bannerInputRef.current.click()}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {formData.bannerFile ? 'Change Banner' : 'Upload Banner'}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Recommended size: 1200x300px</p>
                </div>
                {/* Icon/Logo Upload */}
                <div>
                    <Label>Icon/Logo</Label>
                    <div className="flex items-center gap-4">
                        {formData.logoUrl && (
                            <img src={formData.logoUrl} alt="Icon Preview" className="h-12 w-12 object-cover rounded-full border" />
                        )}
                        <input
                            type="file"
                            ref={iconInputRef}
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, 'icon')}
                            accept="image/*"
                        />
                        <Button variant="outline" size="sm" onClick={() => iconInputRef.current.click()}>
                            <UserIcon className="h-4 w-4 mr-2" />
                            {formData.logoFile ? 'Change Icon' : 'Upload Icon'}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Recommended size: 256x256px (square)</p>
                </div>
            </div>
        </div>
    );
};

export default Step2Style; 