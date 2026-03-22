'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only connect if we have a user and a token
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (user && token) {
            // Socket.IO must connect to the root server, not the /api/v1 namespaced path
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
                (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api/v1').replace('/api/v1', '');
            const socketInstance = io(socketUrl, {
                auth: {
                    token
                },
                transports: ['websocket', 'polling'] // fallback string
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected successfully');
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
                setIsConnected(false);
            });

            setSocket(socketInstance);

            // Cleanup on unmount or user change
            return () => {
                socketInstance.disconnect();
            };
        } else if (socket) {
            // If user logs out, kill the connection
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
