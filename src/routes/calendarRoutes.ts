import { Router } from 'express';
import { calendarController } from '../controllers/calendarController';
import { validateCalendarEvent, validateIdParam, validate } from '../middleware/validation';
import { requireAdminApiKey } from '../middleware/auth';
import { publicRateLimiter, adminRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/v1/calendar/events:
 *   get:
 *     summary: Get calendar events
 *     description: Retrieve calendar events with optional date range and blog filtering
 *     tags: [Calendar]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering events (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering events (ISO 8601 format)
 *       - in: query
 *         name: blogId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter events by blog ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         events:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/CalendarEvent'
 *                               - type: object
 *                                 properties:
 *                                   blog:
 *                                     type: object
 *                                     nullable: true
 *                                     properties:
 *                                       slug:
 *                                         type: string
 *                                       title:
 *                                         type: string
 */
router.get(
  '/events',
  publicRateLimiter,
  calendarController.getEvents.bind(calendarController)
);

/**
 * @swagger
 * /api/v1/calendar/events:
 *   post:
 *     summary: Create a calendar event
 *     description: Create a new calendar event (Admin only)
 *     tags: [Calendar]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarEventCreate'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         event:
 *                           $ref: '#/components/schemas/CalendarEvent'
 *                     message:
 *                       type: string
 *                       example: Event created successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       422:
 *         description: Validation error
 */
router.post(
  '/events',
  requireAdminApiKey,
  adminRateLimiter,
  validateCalendarEvent,
  validate,
  calendarController.createEvent.bind(calendarController)
);

/**
 * @swagger
 * /api/v1/calendar/events/{id}:
 *   put:
 *     summary: Update a calendar event
 *     description: Update an existing calendar event by ID (Admin only)
 *     tags: [Calendar]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarEventCreate'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         event:
 *                           $ref: '#/components/schemas/CalendarEvent'
 *                     message:
 *                       type: string
 *                       example: Event updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       404:
 *         description: Event not found
 *       422:
 *         description: Validation error
 */
router.put(
  '/events/:id',
  requireAdminApiKey,
  adminRateLimiter,
  validateIdParam,
  validateCalendarEvent,
  validate,
  calendarController.updateEvent.bind(calendarController)
);

/**
 * @swagger
 * /api/v1/calendar/events/{id}:
 *   delete:
 *     summary: Delete a calendar event
 *     description: Delete a calendar event by ID (Admin only)
 *     tags: [Calendar]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Event deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       404:
 *         description: Event not found
 */
router.delete(
  '/events/:id',
  requireAdminApiKey,
  adminRateLimiter,
  validateIdParam,
  validate,
  calendarController.deleteEvent.bind(calendarController)
);

export default router;
