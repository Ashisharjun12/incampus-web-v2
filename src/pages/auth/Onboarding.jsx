import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { collegeAPI } from '@/api/api';
import { useAuthStore } from '@/store/authstore';
import { useProfileStore } from '@/store/profilestore';
import { Check } from 'lucide-react';

const avatarStyles = [
  'adventurer', 'avataaars', 'bottts', 'micah', 'initials', 'lorelei', 'notionists', 'personas'
];

const generateAvatarUrl = (style, seed) => {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuthStore();
  const { completeOnboarding, loading } = useProfileStore();
  
  const [colleges, setColleges] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [activeStep, setActiveStep] = useState('avatar');
  
  const [formData, setFormData] = useState({
    avatarUrl: '',
    collegeId: '',
    gender: '',
    age: '',
    preferences: {
      sports: false, music: false, adventure: false, technology: false, gaming: false,
      food: false, travel: false, fashion: false, art: false, books: false,
      movies: false, fitness: false, photography: false, cooking: false, pets: false
    },
    bio: '',
    location: ''
  });

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await collegeAPI.getAll();
        setColleges(response.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch colleges');
      }
    };
    fetchColleges();

    const generatedAvatars = Array.from({ length: 12 }, (_, i) => {
      const style = avatarStyles[i % avatarStyles.length];
      const seed = Math.random().toString(36).substring(7);
      return generateAvatarUrl(style, seed);
    });
    setAvatars(generatedAvatars);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAvatarSelect = (url) => {
    handleInputChange('avatarUrl', url);
    setActiveStep('details');
  };
  
  const handlePreferenceChange = (preference, checked) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [preference]: checked }
    }));
  };
  
  const isStepComplete = (step) => {
    if (step === 'avatar') return !!formData.avatarUrl;
    if (step === 'details') return !!formData.collegeId && !!formData.gender && !!formData.age;
    return false;
  };
  
  useEffect(() => {
    if (isStepComplete('details')) {
      setActiveStep('bio');
    }
  }, [formData.collegeId, formData.gender, formData.age]);

  const allRequiredComplete = isStepComplete('avatar') && isStepComplete('details');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRequiredComplete) {
        toast.error("Please complete all required fields.");
        return;
    }
    try {
      const updatedProfile = await completeOnboarding(formData);
      setAuthUser(updatedProfile);
      navigate('/');
    } catch (error) {
      // Error is already handled and toasted in the store
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-black p-4">
      <Card className="w-full max-w-lg bg-white dark:bg-black shadow-lg border border-gray-200 dark:border-gray-800 rounded-lg">
        {/* Stepper */}
        <div className="flex justify-center gap-4 pt-8 pb-2">
          <div className={`flex flex-col items-center ${activeStep==='avatar' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-lg mb-1 border-2 border-gray-300 dark:border-gray-600">1</span>
            <span className="text-xs font-semibold">Avatar</span>
          </div>
          <div className="w-8 h-1 bg-gray-300 dark:bg-gray-700 rounded-full self-center mt-3" />
          <div className={`flex flex-col items-center ${activeStep==='details' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-lg mb-1 border-2 border-gray-300 dark:border-gray-600">2</span>
            <span className="text-xs font-semibold">Details</span>
          </div>
          <div className="w-8 h-1 bg-gray-300 dark:bg-gray-700 rounded-full self-center mt-3" />
          <div className={`flex flex-col items-center ${activeStep==='bio' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-lg mb-1 border-2 border-gray-300 dark:border-gray-600">3</span>
            <span className="text-xs font-semibold">Bio</span>
          </div>
        </div>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl text-gray-900 dark:text-white font-bold">Welcome to InCampus</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Complete the steps to set up your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Accordion type="single" value={activeStep} onValueChange={setActiveStep} className="w-full space-y-3">
              {/* Step 1: Avatar */}
              <AccordionItem value="avatar" className="rounded-lg bg-gray-50 dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800">
                <AccordionTrigger className="p-4 text-base hover:no-underline">
                  <div className="flex items-center gap-3">
                    {isStepComplete('avatar') ? <Check className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <div className="w-5 h-5" />}
                    <span>Step 1: Choose your Avatar</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t-0">
                  <div className="grid grid-cols-4 gap-4">
                    {avatars.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Avatar ${i}`}
                        className={`cursor-pointer rounded-full p-1 border-2 aspect-square transition-all hover:scale-110 hover:shadow-lg ${formData.avatarUrl === url ? 'border-gray-900 dark:border-gray-100 ring-2 ring-gray-300 dark:ring-gray-700' : 'border-transparent hover:border-gray-400 dark:hover:border-gray-600'}`}
                        style={{ width: 64, height: 64 }}
                        onClick={() => handleAvatarSelect(url)}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button type="button" variant="outline" className="rounded-md px-4 py-1 text-xs" onClick={() => setAvatars(Array.from({ length: 12 }, (_, i) => { const style = avatarStyles[i % avatarStyles.length]; const seed = Math.random().toString(36).substring(7); return generateAvatarUrl(style, seed); }))}>
                      Randomize Avatars
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              {/* Step 2: Details */}
              <AccordionItem value="details" disabled={!isStepComplete('avatar')} className="rounded-lg bg-gray-50 dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800">
                <AccordionTrigger className="p-4 text-base hover:no-underline">
                   <div className="flex items-center gap-3">
                    {isStepComplete('details') ? <Check className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <div className="w-5 h-5" />}
                    <span>Step 2: Add your Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-6 border-t-0">
                  <div className="space-y-2">
                    <Label>College</Label>
                    <Select onValueChange={(value) => handleInputChange('collegeId', value)}>
                      <SelectTrigger className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 rounded-md">
                        <SelectValue placeholder="Select your college" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="flex items-center gap-2">
                              {c.logoUrl && (
                                <img
                                  src={c.logoUrl}
                                  alt={c.name}
                                  className="h-6 w-6 rounded-full object-cover border border-gray-300"
                                />
                              )}
                              <span>{c.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 rounded-md">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Select onValueChange={(value) => handleInputChange('age', value)}>
                        <SelectTrigger className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 rounded-md">
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 87 }, (_, i) => i + 13).map(age => (
                            <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                   <div>
                    <Label className="mb-3 block">Interests (Optional)</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.keys(formData.preferences).map(key => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox id={key} checked={formData.preferences[key]} onCheckedChange={(c) => handlePreferenceChange(key, c)} />
                          <Label htmlFor={key} className="capitalize text-sm font-normal cursor-pointer">{key}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              {/* Step 3: Bio */}
              <AccordionItem value="bio" disabled={!isStepComplete('details')} className="rounded-lg bg-gray-50 dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800">
                <AccordionTrigger className="p-4 text-base hover:no-underline">
                   <div className="flex items-center gap-3">
                    <div className="w-5 h-5" />
                    <span>Step 3: Write your Bio (Optional)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t-0">
                  <Textarea
                    placeholder="Tell us a little about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="min-h-[120px] resize-none bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 rounded-md"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button
              type="submit"
              className={`w-full mt-8 h-12 text-base rounded-md font-semibold shadow border border-gray-300 dark:border-gray-700 transition-all duration-200 
                ${loading || !allRequiredComplete 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900'}`}
              disabled={loading || !allRequiredComplete}
            >
              {loading ? 'Setting up...' : 'Finish & Enter InCampus'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;