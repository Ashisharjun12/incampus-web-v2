import React, { useState, useCallback, memo } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

// Memoize the sidebar to prevent unnecessary re-renders
const MemoizedAdminSidebar = memo(AdminSidebar);
const MemoizedAdminHeader = memo(AdminHeader);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use useCallback to prevent function recreation on every render
  const handleSidebarToggle = useCallback((open) => {
    setSidebarOpen(open);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => handleSidebarToggle(false)}
        />
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border">
          <MemoizedAdminSidebar />
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <MemoizedAdminSidebar setSidebarOpen={handleSidebarToggle} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <MemoizedAdminHeader setSidebarOpen={handleSidebarToggle} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default memo(AdminLayout); 