import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authstore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { LogOut, User as UserIcon, Plus, Bell, Settings } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Button } from '@/components/ui/button';

const Navigation = ({ onCreatePost }) => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const userInitial = authUser?.anonymousUsername?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || '?';
  const avatarUrl = authUser?.avatarUrl || authUser?.googleAvatarUrl;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleNotifications = () => {
    navigate('/mentions');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-sm flex items-center justify-between h-16 px-6">
      {/* Logo */}
      <span className="font-bold text-xl text-gray-900 dark:text-white">InCampus</span>
      
      {/* Right side actions */}
      <div className="hidden md:flex items-center gap-3">
        {authUser ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
              onClick={handleNotifications}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
              onClick={() => navigate('/saved')}
              aria-label="Saved Posts"
            >
              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            
            <ModeToggle />
            
            <Button
              variant="default"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-medium"
              onClick={onCreatePost}
            >
              <Plus className="h-4 w-4" />
              <span>Post</span>
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center focus:outline-none hover:opacity-80 transition-opacity">
                  <Avatar className="h-9 w-9 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => navigate(`/profile/${authUser.userId}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => navigate('/saved')}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    Saved Posts
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 dark:text-red-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <Button 
            variant="default" 
            onClick={handleLogin} 
            className="px-6 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-medium"
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navigation;