import { Router } from 'express';
import { calendarController } from '../controllers/calendarController';
import { validateCalendarEvent, validateIdParam, validate } from '../middleware/validation';
import { requireAdminApiKey } from '../middleware/auth';
import { publicRateLimiter, adminRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get(
  '/events',
  publicRateLimiter,
  calendarController.getEvents.bind(calendarController)
);

// Admin routes
router.post(
  '/events',
  requireAdminApiKey,
  adminRateLimiter,
  validateCalendarEvent,
  validate,
  calendarController.createEvent.bind(calendarController)
);

router.put(
  '/events/:id',
  requireAdminApiKey,
  adminRateLimiter,
  validateIdParam,
  validateCalendarEvent,
  validate,
  calendarController.updateEvent.bind(calendarController)
);

router.delete(
  '/events/:id',
  requireAdminApiKey,
  adminRateLimiter,
  validateIdParam,
  validate,
  calendarController.deleteEvent.bind(calendarController)
);

export default router;
