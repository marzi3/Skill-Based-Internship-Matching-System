import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create an Axios instance
// baseURL is just the origin — callers use full paths like /api/v1/auth/login
const apiClient = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api/v1').replace(/\/$/, '') + '/',
    withCredentials: true,
});

console.log('API Client Initialized with baseURL:', apiClient.defaults.baseURL);

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Automatically trim leading slash from relative URLs to ensure proper concatenation with baseURL
        // This fixes 404 errors caused by axios replacing the baseURL suffix
        if (config.url && config.url.startsWith('/') && !config.url.startsWith('http')) {
            config.url = config.url.substring(1);
        }

        // Ensure this only runs on the client side
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // If the API returns a 401 (Unauthorized), automatically log the user out on the client side
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');

                // If we aren't already on the login page or a public page, redirect to login
                const currentPath = window.location.pathname;
                if (!['/login', '/register', '/'].includes(currentPath)) {
                    window.location.href = '/login?session_expired=true';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
