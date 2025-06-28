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
      <div className="max-w-4xl mx-auto">
        <Card className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
       
          
          <CardContent className="px-6 pb-6">
            {/* Search Input and Filter */}
            <div className="flex gap-3 mb-8">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 h-11 text-base bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 rounded-md"
                  placeholder="Search users, communities, posts..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
              
              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 px-4 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md">
                    <Filter className="h-4 w-4 mr-2" />
                    {currentFilter?.label}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md shadow-lg">
                  {filterOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setActiveFilter(option.value)}
                        className={`flex items-center gap-2 p-2 rounded-sm mx-1 my-1 ${
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
              <div className="space-y-6">
                {/* Users Results */}
                {(activeFilter === 'all' || activeFilter === 'users') && searchResults.users.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                      <Users className="h-4 w-4" />
                      Users ({searchResults.users.length})
                    </h2>
                    <div className="space-y-2">
                      {searchResults.users.map(user => (
                        <Card 
                          key={user.id} 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatarUrl} alt={user.username} />
                                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                  {user.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium truncate text-gray-900 dark:text-white">{user.username}</h3>
                                 
                                </div>
                            
                                {user.college && (
                                  <div className="flex items-center gap-1 mt-1">
                                  
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{user.college.name}</span>
                                  </div>
                                )}
                              </div>
                             
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Communities Results */}
                {(activeFilter === 'all' || activeFilter === 'communities') && searchResults.communities.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                      <Building2 className="h-4 w-4" />
                      Communities ({searchResults.communities.length})
                    </h2>
                    <div className="space-y-2">
                      {searchResults.communities.map(community => (
                        <Card 
                          key={community.id} 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md"
                          onClick={() => handleCommunityClick(community.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={community.logoUrl} alt={community.name} />
                                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                  {community.name?.charAt(0).toUpperCase() || 'C'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium truncate text-gray-900 dark:text-white">c/{community.name}</h3>
                                  {community.isNsfw && (
                                    <Badge variant="destructive" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                      NSFW
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {community.description || 'No description available'}
                                </p>
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts Results */}
                {(activeFilter === 'all' || activeFilter === 'posts') && searchResults.posts.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                      <Hash className="h-4 w-4" />
                      Posts ({searchResults.posts.length})
                    </h2>
                    <div className="space-y-2">
                      {searchResults.posts.map(post => (
                        <Card 
                          key={post.id} 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md"
                          onClick={() => handlePostClick(post.id)}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
                                  <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                                    {post.author.username?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-sm text-gray-900 dark:text-white">{post.author.username}</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">in</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300">c/{post.community.name}</span>
                                  </div>
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
                                  <Badge variant="destructive" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                    NSFW
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Search; 