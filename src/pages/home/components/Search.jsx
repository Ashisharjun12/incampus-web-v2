import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search as SearchIcon, 
  Users, 
  Building2, 
  Hash, 
  Filter,
  Calendar,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { searchAPI } from '@/api/api';
import useDebounce from '@/hooks/useDebounce';
import { toast } from 'sonner';

const Search = () => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    users: [],
    communities: [],
    posts: []
  });
  const navigate = useNavigate();
  
  const debouncedQuery = useDebounce(query, 500);

  const filterOptions = [
    { value: 'all', label: 'All', icon: SearchIcon },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'communities', label: 'Communities', icon: Building2 },
    { value: 'posts', label: 'Posts', icon: Hash },
  ];

  const currentFilter = filterOptions.find(option => option.value === activeFilter);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      performSearch();
    } else {
      setSearchResults({ users: [], communities: [], posts: [] });
    }
  }, [debouncedQuery, activeFilter]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      
      if (activeFilter === 'all') {
        response = await searchAPI.globalSearch({ 
          query: debouncedQuery, 
          type: 'all',
          limit: 10 
        });
        setSearchResults(response.data.data);
      } else if (activeFilter === 'users') {
        response = await searchAPI.searchUsers({ 
          query: debouncedQuery, 
          limit: 20 
        });
        setSearchResults({ 
          users: response.data.data, 
          communities: [], 
          posts: [] 
        });
      } else if (activeFilter === 'communities') {
        response = await searchAPI.searchCommunities({ 
          query: debouncedQuery, 
          limit: 20 
        });
        setSearchResults({ 
          users: [], 
          communities: response.data.data, 
          posts: [] 
        });
      } else if (activeFilter === 'posts') {
        response = await searchAPI.searchPosts({ 
          query: debouncedQuery, 
          limit: 20 
        });
        setSearchResults({ 
          users: [], 
          communities: [], 
          posts: response.data.data 
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleCommunityClick = (communityId) => {
    navigate(`/community/${communityId}`);
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 w-full">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-11 text-base bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-0 rounded-xl shadow-none"
              placeholder="Search users, communities, posts..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 shadow-none" aria-label="Filter search">
                <Filter className="h-5 w-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg">
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setActiveFilter(option.value)}
                    className={`flex items-center gap-2 p-3 rounded-md mx-1 my-1 ${
                      activeFilter === option.value ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Results */}
        {query.length >= 2 && (
          <div className="space-y-8">
            {/* Users Results */}
            {(activeFilter === 'all' || activeFilter === 'users') && searchResults.users.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-1">
                  <Users className="h-4 w-4" />
                  Users
                </h2>
                <div className="flex flex-col gap-0">
                  {searchResults.users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 py-3 px-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0 bg-transparent cursor-pointer group transition"
                      onClick={() => handleUserClick(user.id)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleUserClick(user.id); }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate text-gray-900 dark:text-white group-hover:underline">{user.username}</span>
                        {user.college && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{user.college.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communities Results */}
            {(activeFilter === 'all' || activeFilter === 'communities') && searchResults.communities.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-1">
                  <Building2 className="h-4 w-4" />
                  Communities
                </h2>
                <div className="flex flex-col gap-0">
                  {searchResults.communities.map(community => (
                    <div
                      key={community.id}
                      className="flex items-center gap-3 py-3 px-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0 bg-transparent cursor-pointer group transition"
                      onClick={() => handleCommunityClick(community.id)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCommunityClick(community.id); }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={community.logoUrl} alt={community.name} />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {community.name?.charAt(0).toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate text-gray-900 dark:text-white group-hover:underline">c/{community.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {community.isNsfw && (
                            <Badge variant="destructive" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">NSFW</Badge>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{community.description || 'No description available'}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 dark:text-gray-500">
                          <span>{community.memberCount || 0} members</span>
                          <span>{community.postCount || 0} posts</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(community.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Results */}
            {(activeFilter === 'all' || activeFilter === 'posts') && searchResults.posts.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-1">
                  <Hash className="h-4 w-4" />
                  Posts
                </h2>
                <div className="flex flex-col gap-0">
                  {searchResults.posts.map(post => (
                    <div
                      key={post.id}
                      className="flex flex-col gap-1 py-3 px-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0 bg-transparent cursor-pointer group transition"
                      onClick={() => handlePostClick(post.id)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePostClick(post.id); }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
                          <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                            {post.author.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm text-gray-900 dark:text-white group-hover:underline">{post.author.username}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">in</span>
                          <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">c/{post.community.name}</span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{truncateText(post.caption, 120)}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                        <span>{post.likeCount || 0} likes</span>
                        <span>{post.commentCount || 0} comments</span>
                        {post.isNsfw && (
                          <Badge variant="destructive" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">NSFW</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && 
             searchResults.users.length === 0 && 
             searchResults.communities.length === 0 && 
             searchResults.posts.length === 0 && (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try searching with different keywords or check your spelling.
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-500" />
                <p className="text-gray-500 dark:text-gray-400">Searching...</p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {query.length < 2 && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Start searching</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Enter at least 2 characters to search for users, communities, and posts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 