import React, { useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authstore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const AdminHeader = ({ setSidebarOpen }) => {
    const { authUser } = useAuthStore();
    const userInitial = authUser?.name?.charAt(0).toUpperCase() || '?';

    const handleSidebarToggle = useCallback(() => {
        if (setSidebarOpen) {
            setSidebarOpen(true);
        }
    }, [setSidebarOpen]);

    return (
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleSidebarToggle}
            >
                <Menu className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-1 justify-end items-center gap-x-4 self-stretch lg:gap-x-6">
               <span className="text-sm font-medium">{authUser?.name}</span>
               <Avatar className="h-8 w-8">
                <AvatarImage src={authUser?.googleAvatarUrl} alt={authUser?.name} />
                <AvatarFallback>{userInitial}</AvatarFallback>
               </Avatar>
            </div>
        </div>
    )
}

export default memo(AdminHeader); 