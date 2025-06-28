import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authstore';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthCallback } = useAuthStore();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const onboarding = queryParams.get('onboarding');

    if (token) {
      handleAuthCallback(token)
        .then(() => {
          toast.success('Successfully logged in!', {
            style: {
              background: '#22c55e',
              color: 'white',
              border: '1px solid #16a34a'
            }
          });
          if (onboarding) {
            navigate('/onboarding', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        })
        .catch((error) => {
          toast.error('Login failed. Please try again.', {
            style: {
              background: '#ef4444',
              color: 'white',
              border: '1px solid #dc2626'
            }
          });
          console.error('Login error:', error);
          navigate('/login', { replace: true });
        });
    } else {
        toast.error('Authentication failed. No token received.', {
          style: {
            background: '#ef4444',
            color: 'white',
            border: '1px solid #dc2626'
          }
        });
        navigate('/login', { replace: true });
    }
  }, [location, navigate, handleAuthCallback]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Authenticating...</p>
    </div>
  );
};

export default AuthCallback; 