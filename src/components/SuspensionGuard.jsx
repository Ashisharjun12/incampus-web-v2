import React, { useState } from 'react';
import { useAuthStore } from '@/store/authstore';
import SuspensionNotice from './SuspensionNotice';

const SuspensionGuard = ({ 
  children, 
  action = 'access this feature',
  onSuspensionDetected,
  showNotice = true 
}) => {
  const { isSuspended } = useAuthStore();
  const [showSuspensionNotice, setShowSuspensionNotice] = useState(false);

  const handleSuspensionDetected = () => {
    if (showNotice) {
      setShowSuspensionNotice(true);
    }
    onSuspensionDetected?.();
  };

  // If user is suspended, show suspension notice instead of children
  if (isSuspended) {
    return (
      <>
        {showSuspensionNotice && (
          <SuspensionNotice 
            onClose={() => setShowSuspensionNotice(false)}
            action={action}
          />
        )}
        <div onClick={handleSuspensionDetected}>
          {children}
        </div>
      </>
    );
  }

  // If user is not suspended, render children normally
  return children;
};

export default SuspensionGuard; 