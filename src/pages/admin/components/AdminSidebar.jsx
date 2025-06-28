import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  FileText, 
  LogOut,
  Brain,
  Shield,
  Users2
} from 'lucide-react';
import { useAuthStore } from '@/store/authstore';

const AdminSidebar = ({ setSidebarOpen }) => {
  const { logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Colleges', href: '/admin/colleges', icon: GraduationCap },
    { name: 'Communities', href: '/admin/communities', icon: Users2 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Posts', href: '/admin/posts', icon: FileText },
    { name: 'AI Model', href: '/admin/ai-model', icon: Brain },
    { name: 'Bad Words', href: '/admin/bad-words', icon: Shield }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-600/90 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar; 