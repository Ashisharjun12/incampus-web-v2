import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Users, Bookmark, Settings, Bell, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authstore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Sidebar = () => {
  const location = useLocation();
  const { authUser } = useAuthStore();
  
  const userInitial = authUser?.anonymousUsername?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || '?';
  const avatarUrl = authUser?.avatarUrl || authUser?.googleAvatarUrl;

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/communities', label: 'Communities', icon: Users },
    { to: '/saved', label: 'Saved', icon: Bookmark },
    { to: '/mentions', label: 'Mentions', icon: Bell },
  ];

  return (
    <div className="h-screen min-h-0 flex flex-col bg-white dark:bg-black border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-100 dark:border-gray-800">
        <span className="font-bold text-xl text-gray-900 dark:text-white">InCampus</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
              )
            }
          >
            <Icon className="mr-3 h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      {authUser && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={authUser?.name} />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {authUser?.anonymousUsername || authUser?.name}
              </p>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 