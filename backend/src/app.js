const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis').default || require('connect-redis');
const redisClient = require('./config/redis');
const helmet = require('helmet');
const passport = require('./config/passport'); // Import passport config
const { globalLimiter } = require('./middleware/rateLimiter');
require('dotenv').config();

const { initSentry, Sentry } = require('./config/sentry');
const app = express();

// Initialize Sentry BEFORE any other middleware
initSentry(app);

// Sentry RequestHandler creates a separate execution context to track transactions
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Middleware
// Set security HTTP headers
app.use(helmet());

// Apply global rate limiting
app.use(globalLimiter);

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies
// Configure session store
let sessionStore;
if (process.env.NODE_ENV === 'test') {
  // Use MemoryStore for testing to avoid Redis connection issues
  sessionStore = new session.MemoryStore();
} else {
  // For connect-redis v7+, it exports RedisStore directly or under .default
  const Store = typeof RedisStore === 'function' ? RedisStore : RedisStore.RedisStore;

  try {
    sessionStore = new Store({ client: redisClient });
    // Note: redisClient connection error is handled in config/redis.js, 
    // but we can also detect if we should fallback here if desired.
  } catch (err) {
    console.warn('⚠️ Redis Store initialization failed, falling back to MemoryStore');
    sessionStore = new session.MemoryStore();
  }
}

app.use(session({
  store: sessionStore,
  secret: process.env.JWT_SECRET, // Throws error later if missing due to previous configs
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));
app.use(passport.initialize()); // Init passport
app.use(passport.session()); // Passport session support

// Static Uploads Folder
app.use('/uploads', express.static('uploads'));

// Routes
const routes = require('./routes/index');
app.use('/api/v1', routes); // Use the index router which includes auth & verification

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Custom Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
