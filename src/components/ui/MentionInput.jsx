import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X } from 'lucide-react';
import { mentionAPI } from '@/api/api';
import { cn } from '@/lib/utils';

const MentionInput = ({ 
  value, 
  onChange, 
  placeholder = "Write a comment...", 
  onSubmit, 
  isSubmitting = false,
  submitText = "Post",
  className,
  showGifButton = true,
  onGifClick,
  showMediaPreview = true,
  media = [],
  onRemoveMedia,
  showPostButton = true
}) => {
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  // Search users for mentions
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setMentionResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await mentionAPI.searchUsers(query);
      if (response.data.success) {
        setMentionResults(response.data.data || []);
      }
    } catch (error) {
      setMentionResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mentionSearch) {
        searchUsers(mentionSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [mentionSearch]);

  // Handle textarea changes and detect @ mentions
  const handleTextChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    
    // Check if we're typing a mention
    const beforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const searchTerm = mentionMatch[1];
      setMentionSearch(searchTerm);
      setShowMentionDropdown(true);
      setSelectedMentionIndex(0);
    } else {
      setShowMentionDropdown(false);
      setMentionSearch('');
    }
  };

  // Insert mention at cursor position
  const insertMention = (user) => {
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    // Find the start of the @ mention
    const mentionStart = beforeCursor.lastIndexOf('@');
    const username = user.username || user.profile?.anonymousUsername || user.name;
    const newValue = beforeCursor.substring(0, mentionStart) + `@${username} ` + afterCursor;
    
    onChange(newValue);
    setShowMentionDropdown(false);
    setMentionSearch('');
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = mentionStart + username.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = (e) => {
    if (!showMentionDropdown) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : mentionResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (mentionResults[selectedMentionIndex]) {
          insertMention(mentionResults[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        setShowMentionDropdown(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[80px] resize-none pr-10 rounded-md bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
        />
        
        {/* Mention dropdown */}
        {showMentionDropdown && (
          <div
            ref={dropdownRef}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-56 overflow-y-auto z-50 p-1"
          >
            {isSearching && (
              <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">Searching...</div>
            )}
            {!isSearching && mentionResults.length > 0 && mentionResults.map((user, index) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-colors",
                  index === selectedMentionIndex ? "bg-gray-100 dark:bg-gray-900" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                )}
                onClick={() => insertMention(user)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {(user.username || user.name || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium truncate text-gray-900 dark:text-white">
                    {user.username ? `@${user.username}` : (user.name || 'Unknown User')}
                  </div>
                </div>
              </div>
            ))}
            {!isSearching && mentionResults.length === 0 && (
              <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">No users found</div>
            )}
          </div>
        )}
      </div>

      {/* Media preview */}
      {showMediaPreview && media.length > 0 && (
        <div className="flex items-center gap-2">
          {media.map((item, index) => (
            <div key={index} className="relative">
              <img 
                src={item.url} 
                alt="Media" 
                className="h-16 w-16 object-cover rounded-md shadow"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full shadow"
                onClick={() => onRemoveMedia?.(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {showGifButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGifClick}
            className="flex items-center gap-1 rounded-md"
          >
            <Search className="h-4 w-4" />
            GIF
          </Button>
        )}
        
        <div className="flex-1" />
        
        {showPostButton !== false && (
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting || (!value.trim() && media.length === 0)}
            className="rounded-md"
          >
            {isSubmitting ? 'Posting...' : submitText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MentionInput; 