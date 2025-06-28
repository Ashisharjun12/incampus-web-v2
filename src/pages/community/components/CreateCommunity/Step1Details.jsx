import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/store/authstore';
import VerifiedBadge from '@/components/ui/verified-badge';
import NSFWBadge from '@/components/ui/nsfw-badge';

const Step1Details = ({ formData, setFormData }) => {
    const { authUser } = useAuthStore();
    const isAdmin = authUser?.role === 'admin';

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Tell us about your community</h3>
                <p className="text-sm text-muted-foreground">
                    A name and description help people understand what your community is all about.
                </p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Community name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. r/CollegeLife"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Share what your community is about and what people can expect."
                        required
                        rows={4}
                    />
                </div>
                <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="isNsfw" className="font-bold text-red-500 flex items-center gap-2">
                                <NSFWBadge size="small" />
                                18+ community
                            </Label>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Mark your community as NSFW (Not Safe For Work).
                            </p>
                        </div>
                        <Switch
                            id="isNsfw"
                            checked={formData.isNsfw}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNsfw: checked }))}
                        />
                    </div>
                   
                    {isAdmin && (
                        <>
                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm border-blue-200 bg-blue-50">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isVerified" className="font-bold text-blue-600 flex items-center gap-2">
                                        <VerifiedBadge size="small" />
                                        Verified Community
                                    </Label>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Give this community a blue verification badge. Only admins can create verified communities.
                                    </p>
                                </div>
                                <Switch
                                    id="isVerified"
                                    checked={formData.isVerified}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm border-green-200 bg-green-50">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isAdminCreated" className="font-bold text-green-600">Admin Created</Label>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Mark this as an official admin-created community for the college.
                                    </p>
                                </div>
                                <Switch
                                    id="isAdminCreated"
                                    checked={formData.isAdminCreated}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAdminCreated: checked }))}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step1Details; 