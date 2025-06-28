import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Mail, 
  LogOut,
  UserX,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authstore';

const SuspendedUser = () => {
  const { authUser, logout } = useAuthStore();
  
  const isDeleted = authUser?.profile?.status === 'deleted';
  const isSuspended = authUser?.profile?.status === 'suspended';

  const handleLogout = () => {
    logout();
  };

  const handleContactSupport = () => {
    // Open email with specific address
    const subject = isDeleted ? 'Account Deletion Appeal' : 'Account Suspension Appeal';
    const body = `Hello,\n\nI would like to appeal the ${isDeleted ? 'deletion' : 'suspension'} of my account.\n\nUser Details:\n- Name: ${authUser?.name}\n- Email: ${authUser?.email}\n- User ID: ${authUser?.id}\n\nPlease review my case and respond accordingly.\n\nThank you.`;
    
    window.open(`mailto:ashishrahul748@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-black shadow-xl border border-red-200 dark:border-red-800">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            {isDeleted ? (
              <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
            ) : (
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle className="text-xl font-bold text-red-900 dark:text-red-100">
            {isDeleted ? 'Account Deleted' : 'Account Suspended'}
          </CardTitle>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {isDeleted 
              ? 'Your account has been permanently deleted by an administrator.'
              : 'Your account has been temporarily suspended by an administrator.'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant="destructive" 
              className="px-3 py-1 text-sm font-medium"
            >
              {isDeleted ? 'DELETED' : 'SUSPENDED'}
            </Badge>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">{authUser?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">{authUser?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                {isDeleted ? 'Permanently Deleted' : 'Temporarily Suspended'}
              </span>
            </div>
          </div>

          {/* Information */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  What does this mean?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {isDeleted 
                    ? 'Your account has been permanently removed from the platform. You cannot access any features or content.'
                    : 'Your account has been temporarily restricted. You cannot access the platform until the suspension is lifted.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Contact Support
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  If you believe this action was taken in error, please contact our support team:
                </p>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  ashishrahul748@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleContactSupport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Need Help?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please include your user details when contacting support for faster resolution.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 InCampus. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspendedUser; 