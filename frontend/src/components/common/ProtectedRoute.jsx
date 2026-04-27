'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from './Loader';

// Protected Route Component - Checks authentication via AuthContext
export const ProtectedRoute = ({
  children,
  requiredRole = null,
  fallback = null,
  redirectTo = '/login',
  className = '',
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage first for fast rejection
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        if (!storedUser || !token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push(redirectTo);
          return;
        }

        // Validate token against the backend to prevent stale sessions
        const apiClient = (await import('@/services/apiClient')).default;
        let validatedUser;
        try {
          const { data } = await apiClient.get('/auth/me');
          validatedUser = data;
        } catch {
          // Token is expired/invalid — clear stale data and redirect
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push(redirectTo);
          return;
        }

        // Check if user has required role
        if (requiredRole && validatedUser?.role !== requiredRole) {
          setIsAuthenticated(false);
          setIsLoading(false);

          // Redirect to their correct dashboard based on role
          const getRoleDashboard = (role) => {
            switch (role) {
              case 'employer': return '/employer/dashboard';
              case 'admin': return '/admin/admin-dashboard';
              case 'student':
              default: return '/student-dashboard';
            }
          };

          router.push(getRoleDashboard(validatedUser?.role));
          return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [requiredRole, router, redirectTo]);

  if (isLoading) {
    return fallback || <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div className={className}>{children}</div>;
};

// Role Based Access Control Component
export const RoleBasedAccess = ({
  children,
  allowedRoles = [],
  fallback = null,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      const userData = JSON.parse(user);
      const userRole = userData?.role;

      // Check if user's role is in allowed roles
      setHasAccess(allowedRoles.includes(userRole));
      setIsLoading(false);
    } catch (error) {
      console.error('RBAC check failed:', error);
      setHasAccess(false);
      setIsLoading(false);
    }
  }, [allowedRoles]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!hasAccess) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-xl text-gray-600">Access Denied</p>
          <p className="text-gray-500 mt-2">You don't have permission to access this resource</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Auth Context Hook (for managing authentication state globally)
export const useAuth = () => {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setUser(null);
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated,
  };
};

// Session Timeout Component
export const SessionTimeout = ({
  timeout = 30 * 60 * 1000, // 30 minutes default
  warningTime = 5 * 60 * 1000, // 5 minutes before timeout
  onTimeout = null,
  onWarning = null,
  children,
}) => {
  const router = useRouter();
  const [showWarning, setShowWarning] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(timeout);
  const timeoutRef = React.useRef(null);
  const warningRef = React.useRef(null);
  const activityRef = React.useRef(null);

  // Clear existing timers
  const clearTimers = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (activityRef.current) clearInterval(activityRef.current);
  }, []);

  // Set up timers
  const resetTimers = React.useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setTimeRemaining(timeout);

    // Warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      if (onWarning) onWarning();

      // Count down from warning time
      activityRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            clearInterval(activityRef.current);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }, timeout - warningTime);

    // Timeout timer
    timeoutRef.current = setTimeout(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      if (onTimeout) onTimeout();
      router.push('/login?session=expired');
    }, timeout);
  }, [timeout, warningTime, onTimeout, onWarning, router, clearTimers]);

  // Handle user activity
  const handleActivity = React.useCallback(() => {
    if (!showWarning) {
      resetTimers();
    }
  }, [showWarning, resetTimers]);

  // Setup activity listeners
  React.useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initial setup
    resetTimers();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, []);

  const handleExtendSession = () => {
    resetTimers();
    setShowWarning(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <>
      {children}

      {/* Session Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Session Expiring Soon
              </h3>
              <p className="text-gray-600 mb-4">
                Your session will expire in {minutes}:{seconds < 10 ? '0' : ''}
                {seconds} due to inactivity.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300 font-medium"
              >
                Logout
              </button>
              <button
                onClick={handleExtendSession}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Anonymous Route Component - Only accessible when NOT logged in
export const AnonymousRoute = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAnonymous, setIsAnonymous] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');

      if (token && user) {
        // User is authenticated, redirect them
        setIsAnonymous(false);
        router.push(redirectTo);
      } else {
        setIsAnonymous(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, redirectTo]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAnonymous) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
