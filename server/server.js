import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Middleware (Helmet)
app.use(helmet());

// Rate Limiter
const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: isDev ? 10000 : 500, // Generous limit in dev to prevent rate-limiting during builder sessions
  message: { message: 'Too many requests from this IP. Please try again after 15 minutes.' }
});
app.use('/api', limiter);

// CORS Configurations
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ResumeRoast AI API is running...' });
});

// Route mappings
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
