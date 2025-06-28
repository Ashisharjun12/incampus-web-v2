import React from 'react';
import { Button } from '@/components/ui/button';
import { authAPI } from '@/api/api';
import { FcGoogle } from 'react-icons/fc';
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { AvatarCircles } from "@/components/magicui/avatar-circles";

// DiceBear avatar URLs (different styles and seeds)
const dicebearAvatarsArr = [
  { imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alice', profileUrl: '#' },
  { imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bob', profileUrl: '#' },
  { imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol', profileUrl: '#' },
  { imageUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=dave', profileUrl: '#' },
  { imageUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=eva', profileUrl: '#' },
  { imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=frank', profileUrl: '#' },

];

function OrbitingDicebearAvatars() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
      <OrbitingCircles iconSize={48} radius={160} duration={22}>
        {dicebearAvatarsArr.map((avatar, idx) => (
          <img
            key={idx}
            src={avatar.imageUrl}
            alt={`Avatar ${idx}`}
            className="rounded-full border-4 border-white shadow-lg bg-white object-cover h-12 w-12"
            draggable={false}
          />
        ))}
      </OrbitingCircles>
      <OrbitingCircles iconSize={40} radius={100} duration={22} reverse speed={1.5}>
        {dicebearAvatarsArr.map((avatar, idx) => (
          <img
            key={idx}
            src={avatar.imageUrl}
            alt={`Avatar ${idx}`}
            className="rounded-full border-4 border-white shadow-lg bg-white object-cover h-10 w-10"
            draggable={false}
          />
        ))}
      </OrbitingCircles>
    </div>
  );
}

const AuthPage = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Modern left login card */}
      <div className="flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md mx-auto rounded-3xl shadow-2xl bg-white/70 dark:bg-background/80 backdrop-blur-md px-8 py-10 flex flex-col items-center gap-6">
          {/* AvatarCircles at the top */}
          <AvatarCircles avatarUrls={dicebearAvatarsArr} numPeople={99} />
          {/* Headline and subtext */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Join Your Campus Community, Anonymously</h1>
            <p className="text-muted-foreground text-base">Connect, share, and discover what's happening at your college.</p>
          </div>
          {/* Google login button */}
          <Button 
            size="lg" 
            className="w-full text-base font-semibold shadow-md"
            onClick={() => authAPI.loginWithGoogle()}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
          {/* Terms & Privacy */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            By clicking continue, you agree to our{' '}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{' '}and{' '}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
      {/* Right: Orbiting avatars */}
      <div className="hidden lg:block relative">
        <OrbitingDicebearAvatars />
      </div>
    </div>
  );
};

export default AuthPage;