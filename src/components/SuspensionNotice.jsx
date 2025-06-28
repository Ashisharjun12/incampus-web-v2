import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Ban, 
  AlertTriangle, 
  Mail, 
  Clock,
  Shield,
  UserX
} from 'lucide-react';
import { useAuthStore } from '@/store/authstore';

const SuspensionNotice = ({ onClose, action = 'perform this action' }) => {
  const { authUser } = useAuthStore();
  const isDeleted = authUser?.profile?.status === 'deleted';
  const isSuspended = authUser?.profile?.status === 'suspended';

  const handleContactSupport = () => {
    const subject = isDeleted ? 'Account Deletion Appeal' : 'Account Suspension Appeal';
    const body = `Hello,\n\nI would like to appeal the ${isDeleted ? 'deletion' : 'suspension'} of my account.\n\nUser Details:\n- Name: ${authUser?.name}\n- Email: ${authUser?.email}\n- User ID: ${authUser?.id}\n\nPlease review my case and respond accordingly.\n\nThank you.`;
    
    window.open(`mailto:ashishrahul748@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleLogout = () => {
    const { logout } = useAuthStore.getState();
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-black shadow-2xl rounded-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shadow">
            {isDeleted ? (
              <UserX className="h-9 w-9 text-red-600 dark:text-red-400" />
            ) : (
              <Ban className="h-9 w-9 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
            {isDeleted ? 'Account Deleted' : 'Account Suspended'}
          </CardTitle>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-1 font-medium">
            You cannot {action} because your account has been {isDeleted ? 'permanently deleted' : 'temporarily suspended'} by an administrator.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="flex justify-center">
            <Badge variant="destructive" className="px-4 py-1 text-base font-semibold rounded-full">
              {isDeleted ? 'DELETED' : 'SUSPENDED'}
            </Badge>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mx-auto mb-2" />
            <div className="font-semibold text-gray-900 dark:text-white mb-1">What does this mean?</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isDeleted
                ? 'Your account has been permanently removed from the platform. You cannot access any features or content.'
                : 'Your account has been temporarily restricted. You cannot access platform features until the suspension is lifted.'}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Contact Support</div>
            <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
              If you believe this action was taken in error, please contact our support team:
            </div>
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">ashishrahul748@gmail.com</div>
            <Button
              onClick={handleContactSupport}
              className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 text-base font-semibold py-3"
          >
            <Shield className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full rounded-full text-base font-semibold py-3"
            >
              Close
            </Button>
          )}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © 2024 InCampus. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspensionNotice; 