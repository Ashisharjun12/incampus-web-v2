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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-black">
      {/* Modern left login card */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 px-8 py-12 flex flex-col items-center gap-8">
          {/* AvatarCircles at the top */}
          <AvatarCircles avatarUrls={dicebearAvatarsArr} numPeople={99} />
          {/* Headline and subtext */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">Welcome to InCampus</h1>
            <p className="text-muted-foreground text-base font-medium">Join your campus community. Connect, share, and discover what's happening at your college.</p>
          </div>
          {/* Google login button */}
          <Button 
            size="lg" 
            className="w-full text-base font-semibold rounded-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 border-none shadow-none transition"
            onClick={() => authAPI.loginWithGoogle()}
          >
            <FcGoogle className="mr-2 h-6 w-6" />
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
      <div className="hidden lg:block relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-neutral-900 dark:to-neutral-950">
        <OrbitingDicebearAvatars />
      </div>
    </div>
  );
};

export default AuthPage;