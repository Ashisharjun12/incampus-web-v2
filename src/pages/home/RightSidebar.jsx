import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Hash, Building2, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authstore';
import { communityAPI } from '@/api/api';

const RightSidebar = () => {
  const { authUser } = useAuthStore();
  const [trendingTopics, setTrendingTopics] = useState([
    { tag: '#collegelife', count: 1240 },
    { tag: '#studytips', count: 890 },
    { tag: '#campusfood', count: 567 },
    { tag: '#exams', count: 432 },
    { tag: '#friendship', count: 321 },
  ]);
  
  const [suggestedCommunities, setSuggestedCommunities] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([
    {
      id: '1',
      name: 'Alex Chen',
      username: 'alexchen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      college: 'MIT',
      mutualConnections: 3
    },
    {
      id: '2', 
      name: 'Sarah Kim',
      username: 'sarahkim',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      college: 'Stanford',
      mutualConnections: 5
    },
    {
      id: '3',
      name: 'Mike Johnson',
      username: 'mikej',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      college: 'Harvard',
      mutualConnections: 2
    }
  ]);

  useEffect(() => {
    // Fetch suggested communities
    const fetchSuggestedCommunities = async () => {
      try {
        const response = await communityAPI.getAll({ limit: 5 });
        if (response.data.success) {
          setSuggestedCommunities(response.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch suggested communities:', error);
      }
    };
    
    fetchSuggestedCommunities();
  }, []);

  return (
    <div className="h-screen min-h-0 flex flex-col bg-white dark:bg-black border-l border-gray-100 dark:border-gray-800 px-6 py-6">
      {/* Trending Topics */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trending</h2>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{topic.tag}</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {topic.count.toLocaleString()}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Communities */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Communities</h2>
        </div>
        <div className="space-y-3">
          {suggestedCommunities.map((community) => (
            <div key={community.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src={community.logoUrl} />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {community.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">c/{community.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {community.memberCount || 0} members
                </p>
              </div>
              <Button size="sm" variant="outline" className="text-xs px-3 py-1 h-7">
                Join
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <Plus className="h-4 w-4 mr-2" />
            Discover more
          </Button>
        </div>
      </div>

      {/* Suggested Users */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Who to follow</h2>
        </div>
        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.mutualConnections} mutual connections
                </p>
              </div>
              <Button size="sm" variant="outline" className="text-xs px-3 py-1 h-7">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <p>© 2024 InCampus</p>
          <div className="flex flex-wrap gap-2">
            <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">About</span>
            <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Privacy</span>
            <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Terms</span>
            <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Help</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar; 