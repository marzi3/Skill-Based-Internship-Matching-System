'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/navigation';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'employer' | 'admin';
    isVerified?: boolean;
    token?: string;
    [key: string]: any;
}

interface AuthResponse {
    success: boolean;
    error?: string;
    data?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (userData: any) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    checkUserLoggedIn: () => Promise<void>;
    forgotPassword: (email: string) => Promise<AuthResponse>;
    resetPassword: (token: string, password: string) => Promise<AuthResponse>;
    getRoleDashboard: (role: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: get the correct dashboard path for a given role
const getRoleDashboard = (role: string): string => {
    switch (role) {
        case 'employer': return '/employer/dashboard';
        case 'admin': return '/admin/admin-dashboard';
        case 'student':
        default: return '/student-dashboard';
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    // Sync user data to localStorage for ProtectedRoute compatibility
    const syncUserToStorage = (userData: User | null) => {
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.token) {
                localStorage.setItem('authToken', userData.token);
                // Also store as 'token' since some existing code might rely on it
                localStorage.setItem('token', userData.token);
            }
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
        }
    };

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await apiClient.get<User>('/api/v1/auth/me');
            setUser(data);
            syncUserToStorage(data);
        } catch (error) {
            setUser(null);
            syncUserToStorage(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const login = async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.post<User>('/api/v1/auth/login', { email, password });

            // Sync immediately before anything else
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            setUser(data);
            syncUserToStorage(data);
            router.push(getRoleDashboard(data.role));
            return { success: true };
        } catch (error: any) {
            console.error('Login Error:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData: any): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.post<User>('/api/v1/auth/register', userData);

            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            setUser(data);
            syncUserToStorage(data);
            router.push(getRoleDashboard(data.role));
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await apiClient.post('/api/v1/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            setUser(null);
            syncUserToStorage(null);
            router.push('/login');
        }
    };

    const forgotPassword = async (email: string): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.post('/api/v1/auth/forgotpassword', { email });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Email could not be sent' };
        }
    };

    const resetPassword = async (token: string, password: string): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.put(`/api/v1/auth/resetpassword/${token}`, { password });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Password reset failed' };
        }
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, checkUserLoggedIn, forgotPassword, resetPassword, getRoleDashboard }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
