'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

// Helper: get the correct dashboard path for a given role
const getRoleDashboard = (role) => {
    switch (role) {
        case 'employer': return '/employer/dashboard';
        case 'admin': return '/admin/admin-dashboard';
        case 'student':
        default: return '/student-dashboard';
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Configure axios defaults
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    axios.defaults.withCredentials = true; // Important for cookies

    // Sync user data to localStorage for ProtectedRoute compatibility
    const syncUserToStorage = (userData) => {
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.token) {
                localStorage.setItem('authToken', userData.token);
            }
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
        }
    };

    useEffect(() => {
        // Check for stored token on initialization
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            console.log('🔍 INIT: Checking stored token:', !!storedToken);
            
            if (storedToken) {
                // Set axios header for subsequent requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                console.log('🔍 INIT: Set axios header with stored token');
            }
        }
        
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await axios.get('/api/auth/me');
            setUser(data);
            syncUserToStorage(data);
        } catch (error) {
            setUser(null);
            syncUserToStorage(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        console.log('🚀 AUTHCONTEXT LOGIN: Function called!', { email, hasPassword: !!password });
        
        try {
            console.log('🔐 LOGIN: Calling API at', axios.defaults.baseURL + '/api/auth/login');
            
            const { data } = await axios.post('/api/auth/login', { email, password });
            
            console.log('✅ LOGIN: Got response:', data);
            console.log('✅ LOGIN: Token in response:', !!data.token);
            
            // Save token to localStorage
            if (data.token) {
                console.log('💾 LOGIN: Saving token to localStorage...');
                localStorage.setItem('token', data.token);
                
                // Set axios header for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                console.log('💾 LOGIN: Set axios Authorization header');
                
                // Verify it was saved
                const verified = localStorage.getItem('token');
                console.log('💾 LOGIN: Token saved successfully:', !!verified);
            } else {
                console.error('❌ LOGIN: No token in response!');
            }
            
            setUser(data);
            syncUserToStorage(data);
            router.push(getRoleDashboard(data.role));
            return { success: true };
        } catch (error) {
            console.error('❌ LOGIN: Error:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post('/api/auth/register', userData);
            setUser(data);
            syncUserToStorage(data);
            router.push(getRoleDashboard(data.role));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            setUser(null);
            syncUserToStorage(null);
            router.push('/login');
        }
    };

    const forgotPassword = async (email) => {
        try {
            const { data } = await axios.post('/api/auth/forgotpassword', { email });
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Email could not be sent' };
        }
    };

    const resetPassword = async (token, password) => {
        try {
            const { data } = await axios.put(`/api/auth/resetpassword/${token}`, { password });
            return { success: true, data };
        } catch (error) {
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

export const useAuth = () => useContext(AuthContext);
