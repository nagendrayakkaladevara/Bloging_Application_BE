import { Router } from 'express';
import { searchController } from '../controllers/searchController';
import { validateSearchQuery, validate } from '../middleware/validation';
import { publicRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/v1/search:
 *   get:
 *     summary: Search blogs
 *     description: Search for blogs by query string with optional tag filtering
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         description: Search query string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tag slugs to filter by
 *     responses:
 *       200:
 *         description: Successful search response
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
 *                         results:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Blog'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *                         query:
 *                           type: string
 *                           description: The search query that was executed
 *                         totalResults:
 *                           type: integer
 *                           description: Total number of results found
 *       422:
 *         description: Validation error - query parameter is required
 */
router.get(
  '/',
  validateSearchQuery,
  validate,
  publicRateLimiter,
  searchController.search.bind(searchController)
);

export default router;
