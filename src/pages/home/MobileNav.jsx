import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Users, Bookmark, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authstore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MobileNav = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!authUser) {
    return null;
  }
  
  const avatarUrl = authUser?.avatarUrl || authUser?.googleAvatarUrl;
  const userInitial = authUser?.anonymousUsername?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || '?';

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/communities', label: 'Communities', icon: Users },
   
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <nav className="h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-around h-full px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  'flex flex-col items-center justify-center h-full flex-1 gap-1 transition-all duration-200',
                  isActive
                    ? 'text-black dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <div className={cn(
                  'p-2 rounded-full transition-all duration-200',
                  isActive 
                    ? 'bg-gray-100 dark:bg-gray-900' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">
                  {link.label}
                </span>
              </Link>
            );
          })}
          
          {/* Profile Avatar */}
          <Link
            to={`/profile/${authUser.userId}`}
            className={cn(
              'flex flex-col items-center justify-center h-full flex-1 gap-1 transition-all duration-200',
              pathname === `/profile/${authUser.userId}`
                ? 'text-black dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            <div className={cn(
              'p-1 rounded-full transition-all duration-200',
              pathname === `/profile/${authUser.userId}`
                ? 'bg-gray-100 dark:bg-gray-900'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
            )}>
              <Avatar className="h-6 w-6">
                <AvatarImage src={avatarUrl} alt={authUser?.name} />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MobileNav; 