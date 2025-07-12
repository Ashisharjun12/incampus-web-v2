import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/home/Home';
import Layout from './pages/layout/Layout';
import AuthPage from './pages/auth/AuthPage';
import AuthCallback from './pages/auth/AuthCallback';
import Onboarding from './pages/auth/Onboarding';
import AdminLayout from './pages/admin/layout/AdminLayout';
import Dashboard from './pages/admin/pages/Dashboard';
import CollegesPage from './pages/admin/pages/Colleges';
import Communities from './pages/admin/pages/Communities';
import Users from './pages/admin/pages/Users';
import UserDetails from './pages/admin/pages/UserDetails';
import AIConfig from './pages/admin/pages/AIConfig';
import BadWordsManagement from './pages/admin/pages/BadWordsManagement';
import { useAuthStore } from './store/authstore';
import Profile from './pages/user/pages/Profile';
import UserProfileById from './pages/user/pages/UserProfileById';
import MentionsPage from './pages/user/pages/MentionsPage';
import CommunitiesPage from './pages/community/pages/CommunitiesPage';
import CommunityDetailsPage from './pages/community/pages/CommunityDetailsPage';
import Search from './pages/home/components/Search';
import EditPostPage from './pages/posts/pages/EditPostPage';
import SavedPostsPage from './pages/posts/pages/SavedPostsPage';
import PostDetail from './pages/posts/pages/PostDetail';
import SuspendedUser from './components/SuspendedUser';


const App = () => {
  const { authUser, isLoading, isSuspended, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is suspended or deleted, show the SuspendedUser component immediately
  if (authUser && isSuspended) {
    return <SuspendedUser />;
  }

  const ProtectedRoutes = () => {
    if (!authUser) return <Navigate to="/login" replace />;
    if (!authUser.isProfileComplete) return <Navigate to="/onboarding" replace />;
    return <Outlet />;
  };

  const OnboardingRoute = () => {
    if (!authUser) return <Navigate to="/login" replace />;
    if (authUser.isProfileComplete) return <Navigate to="/" replace />;
    if (isSuspended) return <Navigate to="/login" replace />;
    return <Onboarding />;
  }

  const AdminRoutes = () => {
    if (!authUser) return <Navigate to="/login" replace />;
    if (authUser.role !== 'admin') return <Navigate to="/" replace />;
    if (isSuspended) return <Navigate to="/login" replace />;
    return <Outlet />;
  }

  return (
    <Routes>
      {/* Auth routes - no navigation */}
      <Route path='/login' element={!authUser ? <AuthPage /> : <Navigate to='/' replace />} />
      <Route path='/auth/callback' element={<AuthCallback />} />
      <Route path='/onboarding' element={<OnboardingRoute />} />

      {/* Admin routes */}
      <Route element={<AdminRoutes />}>
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path='colleges' element={<CollegesPage />} />
          <Route path='communities' element={<Communities />} />
          <Route path='users' element={<Users />} />
          <Route path='users/:userId' element={<UserDetails />} />
          <Route path='ai-model' element={<AIConfig />} />
          <Route path='bad-words' element={<BadWordsManagement />} />
        </Route>
      </Route>

      {/* Main app routes with navigation */}
      <Route path='/' element={<Layout />}>
        <Route index element={authUser ? <Home /> : <Navigate to="/login" replace />} />
        
        {/* Protected routes that require complete profile */}
        <Route element={<ProtectedRoutes />}>
          {/* Add protected routes here */}
          <Route path="/profile/:id" element={<UserProfileById />} />
          <Route path="/mentions" element={<MentionsPage />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/community/:id" element={<CommunityDetailsPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/edit/:id" element={<EditPostPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
        
        </Route>
      </Route>
    </Routes>
  );
};

export default App;