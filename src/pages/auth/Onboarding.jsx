import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { collegeAPI } from '@/api/api';
import { useAuthStore } from '@/store/authstore';
import { useProfileStore } from '@/store/profilestore';
import { 
  Check, 
  User, 
  GraduationCap, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  Loader2
} from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [isGeneratingAvatars, setIsGeneratingAvatars] = useState(false);
  
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

  const steps = [
    {
      id: 'avatar',
      title: 'Choose Your Avatar',
      description: 'Pick an avatar that represents you',
      icon: User,
      required: true
    },
    {
      id: 'details',
      title: 'Personal Details',
      description: 'Tell us about yourself',
      icon: GraduationCap,
      required: true
    },
    {
      id: 'interests',
      title: 'Your Interests',
      description: 'Help us personalize your experience',
      icon: Heart,
      required: false
    },
    {
      id: 'bio',
      title: 'Bio & Location',
      description: 'Share a bit more about yourself',
      icon: Sparkles,
      required: false
    }
  ];

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

    generateNewAvatars();
  }, []);

  const generateNewAvatars = () => {
    setIsGeneratingAvatars(true);
    setTimeout(() => {
      const generatedAvatars = Array.from({ length: 12 }, (_, i) => {
        const style = avatarStyles[i % avatarStyles.length];
        const seed = Math.random().toString(36).substring(7);
        return generateAvatarUrl(style, seed);
      });
      setAvatars(generatedAvatars);
      setIsGeneratingAvatars(false);
    }, 500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAvatarSelect = (url) => {
    handleInputChange('avatarUrl', url);
  };
  
  const handlePreferenceChange = (preference, checked) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [preference]: checked }
    }));
  };

  const isStepComplete = (stepIndex) => {
    const step = steps[stepIndex];
    if (step.id === 'avatar') return !!formData.avatarUrl;
    if (step.id === 'details') return !!formData.collegeId && !!formData.gender && !!formData.age;
    if (step.id === 'interests') return true; // Optional step
    if (step.id === 'bio') return true; // Optional step
    return false;
  };

  const canProceed = () => {
    return isStepComplete(currentStep);
  };

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const allRequiredComplete = isStepComplete(0) && isStepComplete(1);

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

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'avatar':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Your Avatar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select an avatar that best represents you</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {avatars.map((url, i) => (
                <div
                  key={i}
                  className={`relative cursor-pointer group transition-all duration-200 ${
                    formData.avatarUrl === url 
                      ? 'scale-110 ring-4 ring-blue-500 ring-offset-2' 
                      : 'hover:scale-105 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                  }`}
                  onClick={() => handleAvatarSelect(url)}
                >
                  <img
                    src={url}
                    alt={`Avatar ${i}`}
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
                  {formData.avatarUrl === url && (
                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-white bg-blue-500 rounded-full p-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={generateNewAvatars}
                disabled={isGeneratingAvatars}
                className="flex items-center gap-2"
              >
                {isGeneratingAvatars ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isGeneratingAvatars ? 'Generating...' : 'Generate New Avatars'}
              </Button>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Help us personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">College *</Label>
                <Select onValueChange={(value) => handleInputChange('collegeId', value)}>
                  <SelectTrigger className="h-12 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-3">
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
                  <Label className="text-sm font-medium">Gender *</Label>
                  <Select onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="h-12 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
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
                  <Label className="text-sm font-medium">Age *</Label>
                  <Select onValueChange={(value) => handleInputChange('age', value)}>
                    <SelectTrigger className="h-12 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
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
            </div>
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Interests</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select topics that interest you (optional)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(formData.preferences).map(key => (
                <div
                  key={key}
                  className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.preferences[key]
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handlePreferenceChange(key, !formData.preferences[key])}
                >
                  <Checkbox 
                    id={key} 
                    checked={formData.preferences[key]} 
                    onCheckedChange={(c) => handlePreferenceChange(key, c)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label htmlFor={key} className="capitalize text-sm font-medium cursor-pointer flex-1">
                    {key}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bio':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bio & Location</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tell us a bit more about yourself (optional)</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Bio</Label>
                <Textarea
                  placeholder="Tell us a little about yourself..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="min-h-[120px] resize-none bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <Input
                  placeholder="Where are you located?"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="h-12 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to InCampus</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                {React.createElement(steps[currentStep].icon, { 
                  className: "w-8 h-8 text-white" 
                })}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || !allRequiredComplete}
                  className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 rounded-xl font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Finish & Enter InCampus
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding; 