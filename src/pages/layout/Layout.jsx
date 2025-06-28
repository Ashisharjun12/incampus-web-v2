import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../home/Sidebar'
import MobileNav from '../home/MobileNav'
import Navigation from '../home/Navigation'
import CreatePostModal from '../posts/components/CreatePostModal'
import RightSidebar from '../home/RightSidebar'

const Layout = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Optionally, you can handle post creation globally here
  const handlePostCreated = () => {
    setShowCreatePost(false);
    // Optionally trigger a global refresh
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar: Logo left, mode toggle and avatar right */}
      <Navigation onCreatePost={() => setShowCreatePost(true)} />
      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-64 md:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-card border-r border-border">
          <Sidebar />
        </div>
      </div>
      {/* Main content and right sidebar */}
      <div className="md:pl-64 flex">
        <main className="flex-1 min-w-0 h-full max-h-screen overflow-y-auto">
          <Outlet />
        </main>
        {/* Right Sidebar (web only) */}
        <aside className="hidden xl:flex w-80 flex-shrink-0 h-full max-h-screen overflow-y-auto">
          <RightSidebar />
        </aside>
      </div>
      {/* Create Post Modal (global, for topbar create button) */}
      <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} onPostCreated={handlePostCreated} />
      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  )
}

export default Layout