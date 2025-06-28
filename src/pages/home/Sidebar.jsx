import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Users, Bookmark, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/saved', label: 'Saved', icon: Bookmark },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="h-screen min-h-0 flex flex-col  border-r border-border">
      {/* Logo (desktop only) */}
      <div className="hidden md:flex items-center h-16 px-6 border-b border-border">
        <span className="font-bold text-2xl">InCampus</span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
          >
            <Icon className="mr-3 h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 