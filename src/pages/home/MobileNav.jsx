import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, User, Users, Hash, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authstore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    { href: '/search', label: 'Search', icon: Search, isButton: true },
    { href: '/communities', label: 'Community', icon: Users },
    
    { href: `/profile/${authUser.userId}`, label: 'Profile', icon: User, isAvatar: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full z-50">
      <nav className="h-16 w-full bg-white/70 dark:bg-[#18181b]/80 backdrop-blur-xl shadow-2xl rounded-t-2xl border-t border-white/20 dark:border-gray-800 flex items-center justify-around px-2">
        <div className="flex items-center justify-around w-full h-full gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  'flex flex-col items-center justify-center h-full w-full gap-1 text-xs transition-all duration-150',
                  isActive
                    ? 'text-primary drop-shadow-[0_2px_8px_rgba(34,197,94,0.15)] bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-md'
                    : 'text-muted-foreground'
                )}
                style={{ minWidth: 60 }}
              >
                {link.isAvatar ? (
                  <Avatar className="h-8 w-8 shadow border-2 border-white dark:border-gray-800">
                    <AvatarImage src={avatarUrl} alt={authUser?.name} />
                    <AvatarFallback className="bg-muted text-foreground text-xs">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon className="h-7 w-7" />
                )}
                <span className="truncate font-medium tracking-wide">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileNav; 