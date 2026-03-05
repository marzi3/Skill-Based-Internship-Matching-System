const rateLimit = require('express-rate-limit');

// Global rate limiter for all API requests
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => req.method === 'OPTIONS', // Skip CORS preflight requests
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

// Stricter rate limiter for authentication routes (login/register/forgot-password)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 password/login requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS', // Skip CORS preflight requests
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
    }
});

module.exports = {
    globalLimiter,
    authLimiter
};
