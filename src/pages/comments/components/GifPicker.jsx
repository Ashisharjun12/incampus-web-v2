import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { giphyAPI } from '@/api/api';
import { cn } from '@/lib/utils';

const GifPicker = ({ open, onOpenChange, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [gifs, setGifs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load GIFs when search query changes or component opens
    useEffect(() => {
        if (!open) return;

        const loadGifs = async () => {
            setIsLoading(true);
            try {
                let response;
                if (debouncedQuery.trim()) {
                    response = await giphyAPI.search(debouncedQuery);
                    setSearchMode(true);
                } else {
                    response = await giphyAPI.trending();
                    setSearchMode(false);
                }

                const data = await response.json();
                setGifs(data.data || []);
            } catch (error) {
                console.error('Error loading GIFs:', error);
                setGifs([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadGifs();
    }, [debouncedQuery, open]);

    const handleGifSelect = (gif) => {
        onSelect({
            type: 'gif',
            url: gif.images.fixed_height.url,
            originalUrl: gif.images.original.url,
            title: gif.title,
            giphyId: gif.id
        });
        onOpenChange(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setDebouncedQuery(searchQuery);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        {searchMode ? 'Search GIFs' : 'Trending GIFs'}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col h-full">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex gap-2">
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search GIFs..."
                                className="flex-1"
                            />
                            <Button type="submit" size="sm">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>

                    {/* GIF Grid */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[...Array(12)].map((_, i) => (
                                    <Skeleton key={i} className="aspect-square rounded-lg" />
                                ))}
                            </div>
                        ) : gifs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchMode ? (
                                    <>
                                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No GIFs found for "{debouncedQuery}"</p>
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No trending GIFs available</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {gifs.map((gif) => (
                                    <button
                                        key={gif.id}
                                        onClick={() => handleGifSelect(gif)}
                                        className="group relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                                    >
                                        <img
                                            src={gif.images.fixed_height.url}
                                            alt={gif.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GifPicker; 