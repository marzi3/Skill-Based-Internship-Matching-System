'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Configure axios defaults
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    axios.defaults.withCredentials = true; // Important for cookies

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await axios.get('/api/auth/me');
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            setUser(data);
            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post('/api/auth/register', userData);
            setUser(data);
            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error(error);
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

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkUserLoggedIn, forgotPassword, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
