import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authstore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { LogOut, User as UserIcon, Plus, Bell } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 flex items-center justify-between h-16 px-6">
      {/* Logo always visible */}
      <span className="font-bold text-2xl">InCampus</span>
      {/* Right: Create, Mode toggle, Notifications, Avatar or Login button (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-4">
        {authUser ? (
          <>
            <Button
              variant="default"
              className="flex items-center gap-2 px-4 py-2"
              onClick={onCreatePost}
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Create</span>
            </Button>
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleNotifications}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center focus:outline-none">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="flex flex-col gap-2 p-2 w-40">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/70 text-sm font-medium transition-colors"
                >
                  <UserIcon className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 text-sm font-medium text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <Button variant="default" onClick={handleLogin} className="px-6 py-2 text-base font-semibold">Login</Button>
        )}
      </div>
    </header>
  );
};

export default Navigation;