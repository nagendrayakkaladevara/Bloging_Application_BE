import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

// General rate limiter for public endpoints
export const publicRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for admin endpoints
export const adminRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitAdminMaxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for comments (5 per hour per IP)
export const commentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many comments. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
