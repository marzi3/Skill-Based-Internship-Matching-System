import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create an Axios instance
const getApiBaseUrl = (): string => {
    const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    return rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;
};

const apiClient = axios.create({
    baseURL: `${getApiBaseUrl()}/`,
    withCredentials: true,
});



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
                
                const isPublicPath = [
                    '/login', 
                    '/register', 
                    '/', 
                    '/forgot-password'
                ].includes(currentPath) || 
                currentPath.startsWith('/reset-password') || 
                currentPath.startsWith('/verify') || 
                currentPath.startsWith('/find-internships');

                if (!isPublicPath) {
                    window.location.href = '/login?session_expired=true';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
